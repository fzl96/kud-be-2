import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { db } from "../lib/db";

interface resultData {
  month: number;
  totalSales: number;
  totalPurchases: number;
  salesCount: number;
}

const getData = async (year: number) => {
  try {
    const result: resultData[] = await db.$queryRaw`
    SELECT 
      month, 
      SUM(totalSales) as totalSales, 
      SUM(totalPurchases) as totalPurchases,
      COUNT(DISTINCT saleId) as salesCount
    FROM (
      SELECT 
        EXTRACT(MONTH FROM s.createdAt) as month, 
        s.total as totalSales,
        NULL as totalPurchases,
        s.id as saleId
      FROM Sale as s
      WHERE s.createdAt >= ${new Date(year, 0, 1)} AND s.createdAt < ${new Date(
      year + 1,
      0,
      1
    )}
      UNION ALL
      SELECT 
        EXTRACT(MONTH FROM p.createdAt) as month, 
        NULL as totalSales,
        p.total as totalPurchases,
        NULL as saleId
      FROM Purchase as p
      WHERE p.createdAt >= ${new Date(year, 0, 1)} AND p.createdAt < ${new Date(
      year + 1,
      0,
      1
    )}
    ) as subquery
    GROUP BY month;
  `;
    console.log(result);
    const data = result.map((item) => {
      return {
        month: Number(item.month),
        revenue: item.totalSales || 0,
        spending: item.totalPurchases || 0,
        salesCount: Number(item.salesCount) || 0,
      };
    });

    return data;
  } catch (err) {
    console.log(err);
    return [];
  }

  // const sales = await db.sale.findMany({
  //   where: {
  //     createdAt: {
  //       gte: new Date(year, 0, 1),
  //       lt: new Date(year + 1, 0, 1),
  //     },
  //   },
  //   select: {
  //     id: true,
  //     total: true,
  //     createdAt: true,
  //   },
  // })

  // const result = [];
  // if (sales.length === 0) {
  //   for (let month = 1; month <= 12; month++) {
  //     const data = {
  //       month,
  //       revenue: 0,
  //       count: 0,
  //     };
  //     result.push(data);
  //   }
  //   return result;
  // }

  // for (let month = 1; month <= 12; month++) {
  //   const monthData = sales.filter((sale) => {
  //     return new Date(sale.createdAt).getMonth() + 1 === month;
  //   });

  //   const monthTotal = monthData.reduce((acc, sale) => {
  //     return acc + sale.total;
  //   }, 0);

  //   result.push({
  //     month,
  //     total: monthTotal,
  //     count: monthData.length,
  //   });
  // }

  // return result
};

export const getSalesData = async (req: Request, res: Response) => {
  const { year } = req.params;
  const data = await getData(Number(year));
  res.status(200).json(data);
};

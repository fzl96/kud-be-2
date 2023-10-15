import { Request, Response } from "express";
import { db } from "../lib/db.js";

type MonthlyData = {
  month: number;
  totalSales: number;
  totalPurchases: number;
  salesCount: number;
};

type ProductsSale = {
  productId: string;
  name: string;
  sales_count: number;
  total_quantity: number;
};

export const getSalesData = async (req: Request, res: Response) => {
  const { year } = req.params;
  try {
    const monthly = db.$queryRaw`
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
      WHERE s.createdAt >= ${new Date(
        parseInt(year),
        0,
        1
      )} AND s.createdAt < ${new Date(parseInt(year) + 1, 0, 1)}
      UNION ALL
      SELECT 
        EXTRACT(MONTH FROM p.createdAt) as month, 
        NULL as totalSales,
        p.total as totalPurchases,
        NULL as saleId
      FROM Purchase as p
      WHERE p.createdAt >= ${new Date(
        parseInt(year),
        0,
        1
      )} AND p.createdAt < ${new Date(parseInt(year) + 1, 0, 1)}
    ) as subquery
    GROUP BY month;
  `;

    const yearly = db.$queryRaw`
    SELECT
      ps.productId,
      p.name,
      -- COUNT(ps.productId) AS sales_count,
      SUM(ps.quantity) AS total_quantity
    FROM
      ProductSale ps
      INNER JOIN Product p ON ps.productId = p.id
    WHERE
      EXTRACT(YEAR FROM ps.createdAt) = ${year}
    GROUP BY
      ps.productId,
      p.name
    ORDER BY
      total_quantity DESC
    LIMIT 4;
    `;
        
    const [result, result2] = (await db.$transaction([monthly, yearly])) as [
      MonthlyData[],
      ProductsSale[]
    ];

    const monthlySales = result.map((item) => {
      return {
        month: Number(item.month),
        revenue: item.totalSales || 0,
        spending: item.totalPurchases || 0,
        salesCount: Number(item.salesCount) || 0,
      };
    });

    const overall = monthlySales.reduce(
      (acc, item) => {
        return {
          revenue: acc.revenue + item.revenue,
          spending: acc.spending + item.spending,
          salesCount: acc.salesCount + item.salesCount,
        };
      },
      {
        revenue: 0,
        spending: 0,
        salesCount: 0,
      }
    );

    const yearlySales = {
      ...overall,
      avgTransaction: overall.revenue / overall.salesCount,
      products: result2.map((item) => {
        return {
          id: item.productId || "",
          name: item.name || "",
          // salesCount: Number(item.sales_count) || 0,
          quantityCount: Number(item.total_quantity) || 0,
        };
      }),
    };

    const data = {
      monthlySales,
      yearlySales,
    };

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

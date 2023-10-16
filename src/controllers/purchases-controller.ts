import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { createPagination } from "../utils/pagination.js";

const purchaseItemSchema = z.object({
  id: z.string(),
  quantity: z.number().min(1),
  purchasePrice: z.number().positive(),
});

export const getPurchases = async (req: Request, res: Response) => {
  const includeProductsSuppliers =
    req.query.include_products_suppliers === "true";

  const { page, pageSize = 10, search, date } = req.query;
  let skip, take;

  if (page) {
    skip = (Number(page) - 1) * Number(pageSize);
    take = Number(pageSize);
  }

  const where = {} as Prisma.PurchaseWhereInput;
  if (search) {
    where.OR = [
      { supplier: { name: { contains: search as string } } },
      { products: { 
        some: {
          product: {
            name: { contains: search as string },
          },
        },
       } },
    ];
  }

  if (date) {
    const [start, end] = (date as string).split(",");
    const [dayStart, monthStart, yearStart] = start.split("-")
    let dayEnd, monthEnd, yearEnd;
    if (end) {
      [dayEnd, monthEnd, yearEnd] = end.split("-")
    } else {
      dayEnd = dayStart;
      monthEnd = monthStart;
      yearEnd = yearStart;
    }

    const startDate = new Date(Number(yearStart), Number(monthStart) - 1, Number(dayStart))
    const endDate = new Date(Number(yearEnd), Number(monthEnd) - 1, Number(dayEnd))
    endDate.setDate(endDate.getDate() + 1);
  
    where.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  try {
    const purchases = db.purchase.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        products: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            purchasePrice: true,
            total: true,
            quantity: true,
          },
        },
        updatedAt: true,
        supplier: true,
        total: true,
        verified: true,
      },
      skip,
      take,
    });

    const count = db.purchase.count({ where });

    const [purchasesData, purchasesCount] = await Promise.all([
      purchases,
      count,
    ]);

    const mappedPurchases = purchasesData.map((purchase) => ({
      id: purchase.id,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      total: purchase.total,
      supplier: purchase.supplier,
      verified: purchase.verified,
      items: purchase.products.map((product) => ({
        id: product.product.id,
        quantity: product.quantity,
        name: product.product.name,
        purchasePrice: product.purchasePrice,
        total: product.total,
      })),
    }));

    const pagination = createPagination({
      page: Number(page),
      pageSize: Number(pageSize),
      total: purchasesCount,
      url: `${process.env.API_URL}/purchases`,
    })
    
    if (includeProductsSuppliers) {
      const suppliers = await db.supplier.findMany({
        where: { active: true },
      });

      const products = await db.product.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(200).json({
        purchases: {
          data: mappedPurchases,
          pagination,
        },
        suppliers,
        products,
      });
      return;
    }

    res.status(200).json({
      pagination,
      data: mappedPurchases,
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getPurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const purchase = await db.purchase.findUnique({
      where: { id: id },
      include: {
        products: {
          select: {
            quantity: true,
            productId: true,
            purchasePrice: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!purchase) {
      res.status(404).json({ error: "Pembelian tidak ditemukan" });
      return;
    }

    res.status(200).json({
      id: purchase?.id,
      createdAt: purchase?.createdAt,
      updatedAt: purchase?.updatedAt,
      total: purchase?.total,
      supplier: purchase?.supplier,
      verified: purchase?.verified,
      items: purchase?.products.map((product) => ({
        id: product.productId,
        quantity: product.quantity,
        name: product.product.name,
        purchasePrice: product.purchasePrice,
        total: product.purchasePrice * product.quantity,
      })),
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  const { supplierId, items, verified = false } = req.body;

  if (!supplierId || items.length === 0) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  try {
    purchaseItemSchema.array().parse(items);
  } catch (err) {
    console.log(err);
    if (err instanceof Error)
      res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    const purchase = db.purchase.create({
      data: {
        verified,
        supplierId,
        total: items.reduce(
          (acc: number, item: any) => acc + item.purchasePrice * item.quantity,
          0
        ),
        products: {
          create: items.map((item: any) => ({
            product: {
              connect: {
                id: item.id,
              },
            },
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            total: item.purchasePrice * item.quantity,
          })),
        },
      },
    });

    let result;

    if (verified) {
      result = await db.$transaction([
        purchase,
        ...items.map((item: any) => {
          return db.product.update({
            where: {
              id: item.id,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }),
      ]);

      res.status(200).json(result);
      return;
    }
    
    result = await purchase;

    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "Data tidak ditemukan" });
        return;
      } else {
        res.status(500).json({ error: err.message });
        return;
      }
    }
  }
};

export const updatePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { supplierId, items, verified } = req.body;


  if (!supplierId && items.length === 0) {
    return res.status(400).json({ error: "Tidak ada data yang diubah" });
  }

  try {
    purchaseItemSchema.array().parse(items);
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    const existPurchase = await db.purchase.findUnique({
      where: { id: id },
    });

    if (existPurchase?.verified) {
      return res.status(400).json({ error: "Pembelian sudah diverifikasi" });
    }
    
    const previousPurchaseItem = await db.purchaseItem.findMany({
      where: {
        purchaseId: id,
      },
    });

    const itemToCreate = items.filter(
      (item: any) => !previousPurchaseItem.find((i) => i.productId === item.id)
    );

    const itemToUpdate = items.filter((item: any) =>
      previousPurchaseItem.find((i) => i.productId === item.id)
    );

    const itemToDelete = previousPurchaseItem.filter(
      (item) => !items.find((i: any) => i.id === item.productId)
    );

    const updateData: Prisma.PurchaseUpdateInput = {};

    if (supplierId) updateData.supplier = { connect: { id: supplierId } };
    if (verified) updateData.verified = verified;
    if (items.length > 0) {
      updateData.products = {
        create: itemToCreate.map((item: any) => ({
          product: {
            connect: {
              id: item.id,
            },
          },
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          total: item.purchasePrice * item.quantity,
        })),
        update: itemToUpdate.map((item: any) => ({
          where: {
            purchaseId_productId: {
              purchaseId: id,
              productId: item.id,
            },
          },
          data: {
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            total: item.purchasePrice * item.quantity,
          },
        })),
        delete: itemToDelete.map((item) => ({
          purchaseId_productId: {
            purchaseId: id,
            productId: item.productId,
          },
        })),
      };
      updateData.total = items.reduce(
        (acc: number, item: any) => acc + item.purchasePrice * item.quantity,
        0
      );
    }

    const purchase = db.purchase.update({
      where: { id: id },
      data: updateData,
    });

    if (verified) {
      const result = await db.$transaction([
        purchase,
        ...items.map((item: any) => {
          return db.product.update({
            where: {
              id: item.id,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }),
      ]);
      
      res.status(200).json({
        message: "Purchase diupdate",
        result,
      });
      return;
    }

    const result = await purchase;

    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "Data tidak ditemukan" });
        return;
      } else {
        res.status(500).json({ error: err.message });
        return;
      }
    }
  }
};

export const deletePurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existPurchase = await db.purchase.findUnique({
      where: { id: id },
    });

    if (existPurchase?.verified) {
      return res.status(400).json({ error: "Pembelian sudah diverifikasi" });
    }

    const deletePurchaseItem = db.purchaseItem.deleteMany({
      where: {
        purchaseId: id,
      },
    });

    const deletePurchase = db.purchase.delete({
      where: { id: id },
    });

    const [, deletedPurchase] = await db.$transaction([
      deletePurchaseItem,
      deletePurchase,
    ]);
    
    res.status(200).json({
      message: "Purchase deleted",
      deletedPurchase,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "Data tidak ditemukan" });
        return;
      } else {
        res.status(500).json({ error: err.message });
        return;
      }
    }
  }
}

const deletePurchaseFn = async (id: string) => {
  const result = await db.$transaction([
    db.purchaseItem.deleteMany({
      where: {
        purchaseId: id,
      },
    }),
    db.purchase.delete({
      where: { id: id },
    }),
  ]);
  return { message: "Purchase deleted", result };
};

export const deletePurchases = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const existPurchase = await db.purchase.findMany({
      where: { id: { in: ids } },
    });

    const verifiedPurchase = existPurchase.filter((purchase) => purchase.verified);
    if (verifiedPurchase.length > 0) {
      return res.status(400).json({ error: "Pembelian sudah diverifikasi" });
    }
    
    const result = await Promise.all(
      ids.map((id: string) => deletePurchaseFn(id))
    );
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "Data tidak ditemukan" });
        return;
      } else {
        res.status(500).json({ error: err.message });
        return;
      }
    }
  }
};

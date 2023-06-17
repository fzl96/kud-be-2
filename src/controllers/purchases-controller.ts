import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";

const purchaseItemSchema = z.object({
  id: z.string(),
  quantity: z.number().min(1),
  purchasePrice: z.number().positive(),
});

export const getPurchases = async (req: Request, res: Response) => {
  const includeProductsSuppliers =
    req.query.include_products_suppliers === "true";

  try {
    const purchases = await db.purchase.findMany({
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
      },
    });

    const mappedPurchases = purchases.map((purchase) => ({
      id: purchase.id,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      total: purchase.total,
      supplier: purchase.supplier,
      items: purchase.products.map((product) => ({
        id: product.product.id,
        quantity: product.quantity,
        name: product.product.name,
        purchasePrice: product.purchasePrice,
        total: product.total,
      })),
    }));

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
        purchases: mappedPurchases,
        suppliers,
        products,
      });
      return;
    }

    res.status(200).json(mappedPurchases);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getPurchase = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const purchase = await db.purchase.findUnique({
      where: { id: id as string },
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
  const { supplierId, items } = req.body;

  if (!supplierId || items.length === 0) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  try {
    const itemArray = purchaseItemSchema.array().parse(items);
  } catch (err) {
    console.log(err);
    if (err instanceof Error)
      res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    const purchase = db.purchase.create({
      data: {
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
  const { supplierId, items } = req.body;

  if (!supplierId && items.length === 0) {
    return res.status(400).json({ error: "Tidak ada data yang diubah" });
  }

  try {
    const itemArray = purchaseItemSchema.array().parse(items);
  } catch (err) {
    if (err instanceof Error)
      res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    const previousPurchaseItem = await db.purchaseItem.findMany({
      where: {
        purchaseId: id as string,
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
              purchaseId: id as string,
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
            purchaseId: id as string,
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
      where: { id: id as string },
      data: updateData,
    });

    const result = await db.$transaction([
      purchase,
      ...itemToCreate.map((item: any) => {
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
      ...itemToUpdate.map((item: any) => {
        return db.product.update({
          where: {
            id: item.id,
          },
          data: {
            stock: {
              increment:
                item.quantity -
                (previousPurchaseItem.find((i) => i.productId === item.id)
                  ?.quantity ?? 0),
            },
          },
        });
      }),
      ...itemToDelete.map((item) => {
        return db.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }),
    ]);

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

const deletePurchase = async (id: string) => {
  const previousPurchaseItem = await db.purchaseItem.findMany({
    where: {
      purchaseId: id as string,
    },
  });

  if (!previousPurchaseItem) {
    await db.purchase.delete({
      where: {
        id: id as string,
      },
    });
  }

  const result = await db.$transaction([
    ...previousPurchaseItem.map((item) =>
      db.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    ),

    db.purchaseItem.deleteMany({
      where: {
        purchaseId: id as string,
      },
    }),
    db.purchase.delete({
      where: { id: id as string },
    }),
  ]);
  return { message: "Purchase deleted" };
};

export const deletePurchases = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const result = await Promise.all(
      ids.map((id: string) => deletePurchase(id))
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

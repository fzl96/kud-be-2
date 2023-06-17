import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";

const productSchema = z.object({
  id: z.string().optional(),
  quantity: z.number().min(0).optional(),
});

export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await db.sale.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        customerType: true,
        customerName: true,
        total: true,
        paymentMethod: true,
        dueDate: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(200).json(sales);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sale = await db.sale.findUnique({
      where: { id: id as string },
      include: {
        products: {
          select: {
            quantity: true,
            productId: true,
            total: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });
    res.status(200).json({
      id: sale?.id,
      customer: sale?.customer,
      customerType: sale?.customerType,
      customerName: sale?.customerName,
      total: sale?.total,
      cash: sale?.cash,
      change: sale?.change,
      paymentMethod: sale?.paymentMethod,
      status: sale?.status,
      dueDate: sale?.dueDate,
      paid: sale?.paid,
      payments: sale?.payment,
      products: sale?.products.map((product) => ({
        id: product.productId,
        quantity: product.quantity,
        name: product.product.name,
        total: product.total,
      })),
      cashier: sale?.user,
      createdAt: sale?.createdAt,
      updatedAt: sale?.updatedAt,
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      customerType,
      products,
      cash,
      change,
      cashierId,
      status,
      paymentMethod,
      dueDate,
    } = req.body;
    // check if customer and products exist in the request body
    if (!products || !cashierId) {
      res.status(400).json({ error: "Data kurang lengkap" });
      return;
    }

    const isProductValid = products.every(
      (product: any) => productSchema.safeParse(product).success
    );

    // check if the products are valid
    if (!isProductValid) {
      res.status(400).json({ error: isProductValid.error.issues });
      return;
    }

    // get the price of the products
    const productPrices = await db.product.findMany({
      where: {
        id: {
          in: products.map((product: any) => product.id),
        },
      },
      select: {
        id: true,
        price: true,
        stock: true,
      },
    });

    // check if the product is in stock
    const isProductInStock = products.every(
      (product: any) =>
        productPrices.find((p) => p.id === product.id)?.stock! >=
        product.quantity
    );

    if (!isProductInStock) {
      res.status(400).json({ error: "Stok tidak cukup" });
      return;
    }

    const total = products.reduce(
      (acc: number, product: any) =>
        acc +
        productPrices.find((p) => p.id === product.id)?.price! *
          product.quantity,
      0
    );

    if (cash) {
      if (total > cash) {
        res.status(400).json({ error: "Uang tidak cukup" });
        return;
      }
    }

    const createData: Prisma.SaleCreateInput = {
      cash,
      change,
      paymentMethod,
      status,
      dueDate,
      total: total,
      customerType,
      user: { connect: { id: cashierId } },
      products: {
        create: products.map((product: any) => ({
          quantity: product.quantity,
          productId: product.id,
          // multiply the price of the product by the quantity
          total:
            productPrices.find((p) => p.id === product.id)?.price! *
            product.quantity,
        })),
      },
    };

    if (customerId) createData.customer = { connect: { id: customerId } };

    // create the sale
    const sale = db.sale.create({
      data: createData,
    });

    const result = await db.$transaction([
      sale,
      ...products.map((product: any) => {
        return db.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: product.quantity,
            },
          },
        });
      }),
    ]);

    res.status(201).json("Penjualan berhasil ditambahkan");
  } catch (err) {
    console.log(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Customer tidak ditemukan" });
        return;
      } else {
        if (err instanceof Error) {
          res.status(500).json({ error: err.message });
        }
      }
    }
  }
};

export const updateSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, note } = req.body;

  if (!amount) {
    res.status(400).json({ error: "Jumlah pembayaran tidak boleh kosong" });
    return;
  }

  try {
    const sale = await db.sale.findUnique({
      where: { id: id },
      include: {
        payment: true,
      },
    });

    if (!sale) {
      res.status(404).json({ error: "Penjualan tidak ditemukan" });
      return;
    }

    if (sale.paymentMethod === "TUNAI") {
      res.status(400).json({ error: "Penjualan tidak menggunakan kredit" });
      return;
    }

    if (sale.status === "SELESAI") {
      res.status(400).json({ error: "Penjualan sudah dibayar" });
      return;
    }

    const dataToUpdate: Prisma.SaleUpdateInput = {
      paid: sale.paid + amount,
      payment: {
        create: {
          amount: amount,
          note: note,
        },
      },
    };

    if (sale.paid + amount >= sale.total) {
      dataToUpdate.status = "SELESAI";
    }

    const updateSale = await db.sale.update({
      where: { id: id },
      data: dataToUpdate,
    });

    res.status(200).json("Penjualan berhasil diupdate");
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteSale = async (id: string) => {
  // get the products in the sale
  const products = await db.productSale.findMany({
    where: {
      saleId: id,
    },
  });

  // get the quantity of the products
  const productQuantity = products.map((product) => ({
    id: product.productId,
    quantity: product.quantity,
  }));

  // delete the sale and all the items
  const productSale = db.productSale.deleteMany({
    where: {
      saleId: id,
    },
  });

  const payments = db.creditPayment.deleteMany({
    where: {
      saleId: id,
    },
  });

  const sale = db.sale.delete({
    where: { id: id },
  });

  const [productSaleDeleted, paymentsDeleted, saleDeleted] =
    await db.$transaction([
      productSale,
      payments,
      sale,
      ...productQuantity.map((product) => {
        return db.product.update({
          where: { id: product.id },
          data: {
            stock: {
              increment: product.quantity,
            },
          },
        });
      }),
    ]);
  return { message: "Data Penjualan Dihapus" };
};

export const deleteSales = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const result = await Promise.all(ids.map((id: string) => deleteSale(id)));
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

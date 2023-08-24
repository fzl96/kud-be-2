import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../lib/db.js";

export const getCashier = async (req: Request, res: Response) => {
  try {
    const getProducts = db.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        barcode: true,
      },
    });
    const getMembers = db.member.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
      },
    });
    // db transaction
    const [products, members] = await db.$transaction([
      getProducts,
      getMembers,
    ]);

    res.status(200).json({ products, members });
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ error: "Internal Server Error" });
  }
};

const productSchema = z.object({
  id: z.string(),
  quantity: z.number().min(1),
});

const createSaleSchema = z.object({
  memberId: z.string().optional(),
  customerType: z.enum(["ANGGOTA", "UMUM"]),
  products: z.array(productSchema),
  cash: z.number().min(0).optional(),
  change: z.number().min(0).optional(),
  cashierId: z.string(),
  paymentMethod: z.enum(["TUNAI", "KREDIT"]),
  customerName: z.string().optional(),
});

export const postCashier = async (req: Request, res: Response) => {
  try {
    const {
      memberId,
      products,
      cash,
      change,
      cashierId,
      customerType,
      customerName,
      paymentMethod,
    } = req.body;

    const isValid = createSaleSchema.safeParse(req.body);
    if (!isValid.success) {
      res.status(400).json({ error: "Data tidak valid" });
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

    if (!productPrices) {
      res.status(400).json({ error: "Barang tidak ditemukan" });
      return;
    }

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
      status: paymentMethod === "TUNAI" ? "SELESAI" : "PROSES",
      total: total,
      customerName,
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

    if (memberId) createData.member = { connect: { id: memberId } };

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

    res.status(201).json({ message: "Penjualan berhasil ditambahkan", result });
  } catch (err) {
    console.log(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Member tidak ditemukan" });
        return;
      } else {
        if (err instanceof Error) {
          res.status(500).json({ error: err.message });
        }
      }
    }
  }
};

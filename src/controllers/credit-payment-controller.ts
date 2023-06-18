import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { db } from "../lib/db.js";

export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await db.creditPayment.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        amount: true,
        note: true,
        sale: {
          select: {
            id: true,
            customerName: true,
            member: {
              select: {
                id: true,
                name: true,
              },
            },
            paidAmount: true,
            paymentMethod: true,
          },
        },
      },
    });
    res.status(200).json(payments);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const payment = await db.creditPayment.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        amount: true,
        note: true,
        sale: {
          select: {
            id: true,
            customerName: true,
            member: {
              select: {
                id: true,
                name: true,
              },
            },
            paidAmount: true,
            paymentMethod: true,
          },
        },
      },
    });
    res.status(200).json(payment);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  const { amount, note, saleId } = req.body;

  if (!amount) {
    res.status(400).json({ error: "Jumlah pembayaran tidak boleh kosong" });
    return;
  }

  try {
    const sale = await db.sale.findUnique({
      where: { id: saleId },
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
      paidAmount: sale.paidAmount + amount,
      payment: {
        create: {
          amount: amount,
          note: note,
        },
      },
    };

    if (sale.paidAmount + amount >= sale.total) {
      dataToUpdate.status = "SELESAI";
    }

    const updateSale = await db.sale.update({
      where: { id: saleId },
      data: dataToUpdate,
    });

    res.status(200).json("Pembayaran berhasil ditambahkan");
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, note } = req.body;

  if (!amount) {
    res.status(400).json({ error: "Jumlah pembayaran tidak boleh kosong" });
    return;
  }

  try {
    const payment = await db.creditPayment.findUnique({
      where: { id: id as string },
      include: {
        sale: {
          select: {
            id: true,
            paidAmount: true,
            paymentMethod: true,
            status: true,
            total: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ error: "Pembayaran tidak ditemukan" });
      return;
    }

    if (payment.sale.paidAmount === null) {
      res.status(400).json({ error: "Belum ada pembayaran yang dilakukan" });
      return;
    }

    const dataToUpdate: Prisma.CreditPaymentUpdateInput = {
      amount: amount,
      note: note,
    };

    const saleToUpdate: Prisma.SaleUpdateInput = {
      paidAmount: payment.sale.paidAmount - payment.amount + amount,
    };

    if (payment.sale.paidAmount - payment.amount + amount < 0) {
      res.status(400).json({ error: "Jumlah pembayaran tidak valid" });
      return;
    }

    if (
      payment.sale.paidAmount - payment.amount + amount >=
      payment.sale.total
    ) {
      saleToUpdate.status = "SELESAI";
    } else if (
      payment.sale.paidAmount - payment.amount + amount <
      payment.sale.total
    ) {
      saleToUpdate.status = "PROSES";
    }

    const updateSale = db.sale.update({
      where: { id: payment.sale.id },
      data: saleToUpdate,
    });

    const updatePayment = db.creditPayment.update({
      where: { id: id as string },
      data: dataToUpdate,
    });

    const [updatedSale, updatedPayment] = await db.$transaction([
      updateSale,
      updatePayment,
    ]);

    res.status(200).json("Pembayaran berhasil diupdate");
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const payment = await db.creditPayment.findUnique({
      where: { id: id as string },
      include: {
        sale: {
          select: {
            id: true,
            paidAmount: true,
            paymentMethod: true,
            status: true,
            total: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ error: "Pembayaran tidak ditemukan" });
      return;
    }

    if (payment.sale.paidAmount === null) {
      res.status(400).json({ error: "Pembayaran tidak valid" });
      return;
    }

    const updateSale = db.sale.update({
      where: { id: payment.sale.id },
      data: {
        paidAmount: payment.sale.paidAmount - payment.amount,
        status:
          payment.sale.paidAmount - payment.amount < payment.sale.total
            ? "PROSES"
            : "SELESAI",
      },
    });

    const deletePayment = db.creditPayment.delete({
      where: { id: id as string },
    });

    const [daymentDeleted, saleUpdated] = await db.$transaction([
      updateSale,
      deletePayment,
    ]);

    res.status(200).json("Pembayaran berhasil dihapus");
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

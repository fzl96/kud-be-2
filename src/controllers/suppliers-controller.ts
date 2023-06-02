import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { db } from "../lib/db";

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await db.supplier.findMany({
      where: { active: true },
    });
    res.status(200).json(suppliers);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const supplier = await db.supplier.findUnique({
      where: { id: id as string },
    });
    if (!supplier) {
      res.status(404).json({ error: "Supplier tidak ditemukan" });
      return;
    }
    res.status(200).json(supplier);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  const { name, address, phone } = req.body;
  if (!name) {
    res.status(400).json({ error: "Nama supplier harus diisi" });
    return;
  }

  if (typeof name !== "string") {
    res.status(400).json({ error: "Nama supplier harus string" });
    return;
  }

  try {
    const exist = await db.supplier.findUnique({
      where: { name: name },
    });

    if (exist) {
      res.status(400).json({ error: "Nama supplier sudah terdaftar" });
      return;
    }

    const updateData: Prisma.SupplierUpdateInput = {
      active: true,
    };

    if (address) {
      updateData.address = address;
    }

    if (phone) {
      updateData.phone = phone;
    }

    const supplier = await db.supplier.upsert({
      where: { name: name },
      update: updateData,
      create: { name, address, phone },
    });
    res.status(201).json(supplier);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        res.status(400).json({ error: "Nama supplier sudah terdaftar" });
        return;
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address, phone } = req.body;

  if (!name && !address && !phone) {
    res.status(200).json({ message: "Tidak ada data yang diperbarui" });
    return;
  }

  if (!name) {
    res.status(400).json({ error: "Nama supplier harus diisi" });
    return;
  }

  try {
    const supplier = await db.supplier.update({
      where: { id: id as string },
      data: {
        name,
        address,
        phone,
      },
    });
    res.status(200).json({ message: "Supplier updated" });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Supplier tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

const deleteSupplierFn = async (id: string) => {
  try {
    const supplier = await db.supplier.findUnique({
      where: { id: id as string },
      include: { purchases: true },
    });

    if (!supplier) {
      return { error: "Supplier tidak ditemukan" };
    }

    if (supplier.purchases.length > 0) {
      await db.supplier.update({
        where: { id: id as string },
        data: {
          active: false,
        },
      });

      return { message: "Supplier dinonaktifkan" };
    }

    await db.supplier.delete({
      where: { id: id as string },
    });

    return { message: "Supplier dihapus" };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return { error: "Supplier tidak ditemukan" };
      } else {
        return { error: err.message };
      }
    }
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteSupplierFn(id as string);
  if (result?.error) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json({ message: result?.message });
};

export const deleteSuppliers = async (req: Request, res: Response) => {
  const { ids } = req.body;
  const results = await Promise.all(
    ids.map(async (id: string) => {
      return await deleteSupplierFn(id);
    })
  );
  res.status(200).json(results);
};

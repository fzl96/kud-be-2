import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../lib/db.js";

const categorySchema = z.object({
  name: z.string().min(3).max(50),
});

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db.category.findMany();
    res.status(200).json(categories);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const category = await db.category.findUnique({
      where: { id: id },
    });
    if (!category) {
      res.status(404).json({ error: "Kategori tidak ditemukan" });
      return;
    }
    res.status(200).json(category);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Nama Kategori diperlukan" });
    return;
  }

  const isValid = categorySchema.safeParse(req.body);
  if (!isValid.success) {
    res.status(400).json({
      error:
        "Nama Kategori harus string dan memiliki minimal 3 karakter dan maksimal 50 karakter",
    });
    return;
  }

  try {
    const category = await db.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        res.status(400).json({ error: "Kategori sudah ada" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: "Nama Kategori diperlukan" });
    return;
  }

  const isValid = categorySchema.safeParse(req.body);
  if (!isValid.success) {
    res.status(400).json({
      error:
        "Nama Kategori harus string dan memiliki minimal 3 karakter dan maksimal 50 karakter",
    });
    return;
  }

  try {
    const existingCategory = await db.category.findUnique({
      where: { id: id },
    });

    if (existingCategory?.name === name) {
      res.status(200).json({ message: "Tidak ada perubahan" });
      return;
    }

    const category = await db.category.update({
      where: { id: id },
      data: { name },
    });
    res.status(200).json(category);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Kateogri tidak ditemukan" });
      } else if (err.code === "P2002") {
        res.status(400).json({ error: "Kategori sudah ada" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.category.delete({
      where: { id: id },
    });
    res.status(200).json({
      message: `Kategori dengan id ${id} berhasil dihapus`,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Kategori tidak ditemukan" });
      } else if (err.code == "P2003") {
        res.status(400).json({ error: "Kategori mempunyai Produk" });
      } else if (err.code == "P2014") {
        res.status(400).json({ error: "Kategori mempunyai Produk" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const deleteCategories = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const categories = await db.category.deleteMany({
      where: { id: { in: ids } },
    });
    res.status(200).json(categories);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Kategori tidak ditemukan" });
      } else if (err.code == "P2003") {
        res.status(400).json({ error: "Kategori mempunyai Produk" });
      } else if (err.code == "P2014") {
        res.status(400).json({ error: "Kategori mempunyai Produk" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

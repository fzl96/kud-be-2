import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "../lib/db.js";
import { createPagination } from "../utils/pagination.js";

const categorySchema = z.object({
  name: z.string().min(3).max(50),
});

export const getCategories = async (req: Request, res: Response) => {
  const { page, pageSize = 10, search } = req.query;
  let skip, take

  if (page) {
    skip = (Number(page) - 1) * Number(pageSize);
    take = Number(pageSize);
  }

  const where = { } as Prisma.CategoryWhereInput;
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
    ]
  }

  try {
    const categories = db.category.findMany({
      where,
      skip,
      take,
    });
    const count = db.category.count({
      where,
    });
    const [categoriesData, categoriesCount] = await Promise.all([
      categories,
      count,
    ]);

    const pagination = createPagination({
      page: Number(page),
      pageSize: Number(pageSize),
      total: categoriesCount,
      url: `${process.env.API_URL}/categories`,
    })
    
    res.status(200).json({pagination, data: categoriesData});
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
    res.status(204).json({
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
    // check if ids only one, then delete one
    if (ids.length === 1) {
      await db.category.delete({
        where: { id: ids[0] },
      });
      res.status(204).json({
        message: `Kategori berhasil dihapus`,
      });
      return;
    }
    await db.category.deleteMany({
      where: { 
        id: { in: ids },
        products: { none: {} }
     },
    });
    res.status(204).json({
      message: `Kategori berhasil dihapus`,
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

import { Request, Response } from "express";
import { db } from "../db/db.js";
import { category, Category } from "../../drizzle/schema.js";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories: Category[] = await db.select().from(category);
    res.status(200).json(categories);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

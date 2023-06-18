import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { db } from "../lib/db.js";

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await db.role.findMany({});
    if (!roles) {
      res.status(200).json(roles);
    }
    const rolesMapped = roles.map((role) => {
      return {
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
    res.status(200).json(rolesMapped);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await db.role.findUnique({
      where: { id: id as string },
    });
    if (!role) {
      res.status(404).json({ error: "Role tidak ditemukan" });
      return;
    }
    res.status(200).json({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const { name, permissions } = req.body;

  if (!name || permissions.length === 0) {
    res.status(400).json({ error: "Nama dan Hak akses diperlukan" });
    return;
  }

  if (typeof name !== "string") {
    res.status(400).json({ error: "Nama Role harus string" });
    return;
  }

  try {
    const role = await db.role.create({
      data: { name },
    });
    res.status(201).json(role);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        res.status(400).json({ error: "Role sudah ada" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Nama Role diperlukan" });
    return;
  }

  if (typeof name !== "string") {
    res.status(400).json({ error: "Nama Role harus string" });
    return;
  }

  try {
    const updateData: Prisma.RoleUpdateInput = {};

    if (name) updateData.name = name;

    const role = await db.role.update({
      where: { id: id as string },
      data: updateData,
    });

    res.status(200).json(role);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Role tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await db.role.delete({
      where: { id: id as string },
    });
    res.status(200).json(role);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        res.status(400).json({
          error:
            "Role digunakan oleh user, hapus atau ganti role user terlebih dahulu",
        });
      } else if (err.code === "P2025") {
        res.status(400).json({ error: "Role tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const deleteRoles = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const role = await db.role.deleteMany({
      where: { id: { in: ids } },
    });
    res.status(200).json(role);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        res.status(400).json({
          error:
            "Role digunakan oleh user, hapus atau ganti role user terlebih dahulu",
        });
      } else if (err.code === "P2025") {
        res.status(400).json({ error: "Role tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

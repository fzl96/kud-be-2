import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "../lib/db";

const userSchema = z.object({
  name: z.string().optional(),
  username: z.string().min(4).optional(),
  password: z.string().min(4).optional(),
  roleId: z.string().optional(),
});

export const getUsers = async (req: Request, res: Response) => {
  const includeRoles = req.query.include_roles === "true";
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!users) {
      res.status(404).json(users);
      return;
    }
    const mappedUsers = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions.map(
            (permission) => permission.name
          ),
        },
      };
    });

    if (includeRoles) {
      const roles = await db.role.findMany();
      res.status(200).json({ users: mappedUsers, roles });
      return;
    }
    res.status(200).json(mappedUsers);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await db.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        username: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User tidak ditemukan" });
      return;
    }
    const newUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions.map((permission) => permission.name),
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(newUser);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, username, password, confirmPassword, roleId } = req.body;

  if (!name || !username || !password || !confirmPassword || !roleId) {
    res.status(400).json({
      error: "Nama, Username, Password, dan Role tidak boleh kosong",
    });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: "Password tidak sama" });
    return;
  }

  const isValid = userSchema.safeParse(req.body);
  if (!isValid.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create user
    await db.user.create({
      data: { name, username, password: hashedPassword, roleId },
    });

    res.status(201).json({ message: "User dibuat" });
  } catch (err) {
    console.log(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        res.status(400).json({ error: "Username sudah ada" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    username,
    newPassword,
    currentPassword,
    confirmPassword,
    roleId,
  } = req.body;

  if (!name && !username && !newPassword && !confirmPassword && !roleId) {
    res.status(200).json({
      error: "Tidak ada data yang diperbarui",
    });
    return;
  }

  try {
    const updateData: Prisma.UserUpdateInput = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (newPassword) {
      if (!confirmPassword) {
        res.status(400).json({ error: "Konfirmasi password tidak ada" });
        return;
      }
      // compare currentPassword with password in database
      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "Password tidak sama" });
        return;
      }

      const user = await db.user.findUnique({
        where: { id: id as string },
        select: { password: true },
      });
      if (!user) {
        res.status(400).json({ error: "User tidak ditemukan" });
        return;
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ error: "Password lama salah" });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateData.password = hashedPassword;
    }
    if (roleId) updateData.role = { connect: { id: roleId } };

    await db.user.update({
      where: { id: id as string },
      data: updateData,
    });

    res.status(200).json({ message: "User diperbarui" });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "User tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.user.delete({
      where: { id: id as string },
    });
    res.status(200).json({ message: "User dihapus" });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "User tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const deleteUsers = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    await db.user.deleteMany({
      where: { id: { in: ids } },
    });
    res.status(200).json({ message: "User dihapus" });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "User tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

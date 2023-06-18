import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await db.member.findMany({
      where: { active: true },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!members) {
      res.status(200).json(members);
      return;
    }
    const mappedMembers = members.map((member) => {
      return {
        id: member.id,
        name: member.name,
        phone: member.phone,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        status: member.memberRole,
        group: {
          id: member.group?.id,
          name: member.group?.name,
        },
      };
    });
    res.status(200).json(mappedMembers);
  } catch (err) {
    if (err instanceof Error)
      res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMember = async (req: Request, res: Response) => {
  const includeSales = req.query.include_sales === "true";
  const year = req.query.year as string;
  const month = req.query.month as string;

  const { id } = req.params;
  try {
    if (!includeSales) {
      const member = await db.member.findUnique({
        where: { id: id as string },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!member) {
        res.status(404).json({ error: "Anggota tidak ditemukan" });
        return;
      }
      res.status(200).json({
        id: member.id,
        name: member.name,
        phone: member.phone,
        status: member.memberRole,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        group: {
          id: member.group?.id,
          name: member.group?.name,
        },
      });
      return;
    }
    const member = await db.member.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        memberRole: true,
        active: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        sales: {
          where: {
            createdAt: {
              gte: new Date(`${year}-${month}-01`),
              lt: new Date(`${year}-${month}-31`),
            },
          },
          select: {
            id: true,
            total: true,
            createdAt: true,
            updatedAt: true,
            paymentMethod: true,
            status: true,
            products: {
              select: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
                quantity: true,
                total: true,
              },
            },
          },
        },
      },
    });
    if (!member) {
      res.status(404).json({ error: "Anggota tidak ditemukan" });
      return;
    }
    const mappedSales = member.sales.map((sale) => {
      return {
        id: sale.id,
        total: sale.total,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        products: sale.products.map((product) => {
          return {
            id: product.product.id,
            name: product.product.name,
            price: product.product.price,
            quantity: product.quantity,
            total: product.total,
          };
        }),
      };
    });
    res.status(200).json({
      id: member.id,
      name: member.name,
      phone: member.phone,
      status: member.memberRole,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      group: {
        id: member.group?.id,
        name: member.group?.name,
      },
      sales: mappedSales,
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

const memberCreateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  groupId: z.string(),
  status: z.enum(["ANGGOTA", "KETUA"]).optional(),
});

export const createMember = async (req: Request, res: Response) => {
  const { name, phone, groupId, status } = req.body;

  if (!name) {
    res.status(400).json({ error: "Nama tidak boleh kosong" });
    return;
  }

  const isValid = memberCreateSchema.safeParse(req.body);

  if (!isValid.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    if (groupId && status === "KETUA") {
      const group = await db.group.findUnique({
        where: { id: groupId as string },
        include: { members: true },
      });

      if (!group) {
        res.status(404).json({ error: "Kelompok tidak ditemukan" });
        return;
      }

      const leader = group.members.find(
        (member) => member.memberRole === "KETUA"
      );

      if (leader) {
        // change the leader to member
        await db.member.update({
          where: { id: leader.id },
          data: { memberRole: "ANGGOTA" },
        });
      }
    }

    const dataToCreate: Prisma.MemberCreateInput = {
      name,
      phone,
      memberRole: status,
    };

    if (groupId) {
      dataToCreate.group = { connect: { id: groupId } };
    }

    const member = await db.member.create({
      data: dataToCreate,
    });

    res.status(201).json(member);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

const memberUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  groupId: z.string().optional(),
  status: z.enum(["ANGGOTA", "KETUA"]).optional(),
});

export const updateMember = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, groupId, status } = req.body;

  if (!name && !phone && !groupId && !status) {
    res.status(201).json({ error: "Tidak ada data yang diperbarui" });
    return;
  }

  const isValid = memberUpdateSchema.safeParse(req.body);
  if (!isValid.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    const updateData: Prisma.MemberUpdateInput = {};
    if (name) updateData.name = name;
    if (groupId) updateData.group = { connect: { id: groupId } };
    if (status) updateData.memberRole = status;
    if (phone) updateData.phone = phone;

    if (groupId && status === "KETUA") {
      const group = await db.group.findUnique({
        where: { id: groupId as string },
        include: { members: true },
      });

      if (!group) {
        res.status(404).json({ error: "Group tidak ditemukan" });
        return;
      }

      const leader = group.members.find(
        (member) => member.memberRole === "KETUA"
      );

      if (leader) {
        // change the leader to member
        await db.member.update({
          where: { id: leader.id },
          data: { memberRole: "ANGGOTA" },
        });
      }
    }

    const member = await db.member.update({
      where: { id: id as string },
      data: updateData,
    });

    res.status(200).json(member);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "Anggota tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

const deleteMemberFn = async (id: string) => {
  try {
    const member = await db.member.findUnique({
      where: { id: id as string },
      include: { sales: true },
    });

    if (!member) {
      return { error: "Anggota tidak ditemukan" };
    }

    if (member.sales.length) {
      await db.member.update({
        where: { id: id as string },
        data: {
          active: false,
        },
      });
      return { message: "Anggota dihapus" };
    }

    await db.member.delete({
      where: { id: id as string },
    });

    return { message: "Anggota dihapus" };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return { error: "Anggota tidak ditemukan" };
      } else {
        return { error: err.message };
      }
    }
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteMemberFn(id as string);
  if (result?.error) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json({ message: result?.message });
};

export const deleteMembers = async (req: Request, res: Response) => {
  const { ids } = req.body;
  const results = await Promise.all(
    ids.map((id: string) => deleteMemberFn(id))
  );
  const errors = results.filter((result) => result?.error);
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }
  res.status(200).json({ message: "Anggota dihapus" });
};

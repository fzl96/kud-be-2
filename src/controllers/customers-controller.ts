import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";

const customerSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  groupId: z.string().optional(),
  status: z.enum(["ANGGOTA", "KETUA"]).optional(),
});

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await db.customer.findMany({
      where: { active: true },
      include: {
        Group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!customers) {
      res.status(200).json(customers);
      return;
    }
    const mappedCustomers = customers.map((customer) => {
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        status: customer.memberRole,
        group: {
          id: customer.Group?.id,
          name: customer.Group?.name,
        },
      };
    });
    res.status(200).json(mappedCustomers);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  const includeSales = req.query.include_sales === "true";
  const year = req.query.year as string;
  const month = req.query.month as string;

  const { id } = req.params;
  try {
    if (!includeSales) {
      const customer = await db.customer.findUnique({
        where: { id: id as string },
        include: {
          Group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!customer) {
        res.status(404).json({ error: "Customer tidak ditemukan" });
        return;
      }
      res.status(200).json({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        status: customer.memberRole,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        group: {
          id: customer.Group?.id,
          name: customer.Group?.name,
        },
      });
      return;
    }
    const customer = await db.customer.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        memberRole: true,
        Group: {
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
    if (!customer) {
      res.status(404).json({ error: "Customer tidak ditemukan" });
      return;
    }
    const mappedSales = customer.sales.map((sale) => {
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
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      status: customer.memberRole,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      group: {
        id: customer.Group?.id,
        name: customer.Group?.name,
      },
      sales: mappedSales,
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const { name, phone, groupId, status } = req.body;

  if (!name) {
    res.status(400).json({ error: "Nama tidak boleh kosong" });
    return;
  }

  const isValid = customerSchema.safeParse(req.body);

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
        res.status(404).json({ error: "Group tidak ditemukan" });
        return;
      }

      const leader = group.members.find(
        (member) => member.memberRole === "KETUA"
      );

      if (leader) {
        // change the leader to member
        await db.customer.update({
          where: { id: leader.id },
          data: { memberRole: "ANGGOTA" },
        });
      }
    }

    const dataToCreate: Prisma.CustomerCreateInput = {
      name,
      phone,
      memberRole: status,
    };

    if (groupId) {
      dataToCreate.Group = { connect: { id: groupId } };
    }

    const customer = await db.customer.create({
      data: dataToCreate,
    });

    res.status(201).json(customer);
  } catch (err) {
    console.log(err);
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, groupId, status } = req.body;

  if (!name && !phone && !groupId && !status) {
    res
      .status(400)
      .json({ error: "Nama dan nomor telepon tidak boleh kosong" });
    return;
  }

  const isValid = customerSchema.safeParse(req.body);
  if (!isValid.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  try {
    const updateData: Prisma.CustomerUpdateInput = {
      phone,
    };
    if (name) updateData.name = name;
    if (groupId) updateData.Group = { connect: { id: groupId } };
    if (status) updateData.memberRole = status;

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
        await db.customer.update({
          where: { id: leader.id },
          data: { memberRole: "ANGGOTA" },
        });
      }
    }

    const customer = await db.customer.update({
      where: { id: id as string },
      data: updateData,
    });

    res.status(200).json(customer);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "Customer tidak ditemukan" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

const deleteCustomersFn = async (id: string) => {
  try {
    const customer = await db.customer.findUnique({
      where: { id: id as string },
      include: { sales: true },
    });

    if (!customer) {
      return { error: "Customer tidak ditemukan" };
    }

    if (customer.sales.length) {
      await db.customer.update({
        where: { id: id as string },
        data: {
          active: false,
        },
      });
      return { message: "Customer dihapus" };
    }

    await db.customer.delete({
      where: { id: id as string },
    });

    return { message: "Customer dihapus" };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return { error: "Customer tidak ditemukan" };
      } else {
        return { error: err.message };
      }
    }
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteCustomersFn(id as string);
  if (result?.error) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json({ message: result?.message });
};

export const deleteCustomers = async (req: Request, res: Response) => {
  const { ids } = req.body;
  const results = await Promise.all(
    ids.map((id: string) => deleteCustomersFn(id))
  );
  const errors = results.filter((result) => result?.error);
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }
  res.status(200).json({ message: "Customer dihapus" });
};

import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { db } from "../lib/db";

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await db.group.findMany({
      include: {
        members: {
          select: {
            id: true,
            name: true,
            phone: true,
            memberRole: true,
          },
        },
      },
    });

    // if (!groups) {
    //   res.status(200).json(groups);
    // }

    const groupWithLeader = groups.map((group) => {
      const leader = group.members.find(
        (member) => member.memberRole === "KETUA"
      );
      return {
        id: group.id,
        name: group.name,
        numberOfMembers: group.members.length,
        leader: {
          id: leader?.id,
          name: leader?.name,
        },
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    });

    res.status(200).json(groupWithLeader);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const group = await db.group.findUnique({
      where: { id: id as string },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            memberRole: true,
          },
        },
      },
    });

    if (!group) {
      res.status(200).json(group);
    }

    const leader = group?.members.find(
      (member) => member.memberRole === "KETUA"
    );

    res.status(200).json({
      id: group?.id,
      name: group?.name,
      numberOfMembers: group?.members.length,
      createdAt: group?.createdAt,
      updatedAt: group?.updatedAt,
      members: group?.members.map((member) => ({
        id: member.id,
        name: member.name,
        status: member.memberRole,
      })),
      leader: {
        id: leader?.id,
        name: leader?.name,
      },
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  const { name, members, leaderId } = req.body;

  if (!name) {
    res.status(400).json({ error: "Nama tidak boleh kosong" });
    return;
  }

  try {
    const group = await db.group.create({
      data: { name },
    });

    if (members) {
      // members is an array of customer id, update
      const customer = await db.customer.updateMany({
        where: {
          id: {
            in: members,
          },
        },
        data: {
          groupId: group.id,
        },
      });
    }

    if (leaderId) {
      // Set the leader for the group
      const leader = await db.customer.update({
        where: {
          id: leaderId,
        },
        data: {
          groupId: group.id,
          memberRole: "KETUA",
        },
      });
    }

    res.status(201).json(group);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, members, leaderId } = req.body;

  if (!name) {
    res.status(400).json({ error: "Nama tidak boleh kosong" });
    return;
  }

  try {
    const group = await db.group.update({
      where: { id: id as string },
      data: { name },
      include: {
        members: true,
      },
    });

    if (members) {
      // members is an array of customer id, update
      const customer = await db.customer.updateMany({
        where: {
          id: {
            in: members,
          },
        },
        data: {
          groupId: group.id,
        },
      });
    }

    if (leaderId) {
      // set the previous leader to member first before setting the new leader
      const currentLeader = group.members.find(
        (member) => member.memberRole === "KETUA"
      );

      if (currentLeader) {
        await db.customer.update({
          where: {
            id: currentLeader.id,
          },
          data: {
            memberRole: "ANGGOTA",
          },
        });
      }

      // Set the leader for the group
      const leader = await db.customer.update({
        where: {
          id: leaderId,
        },
        data: {
          groupId: group.id,
          memberRole: "KETUA",
        },
      });
    }

    res.status(200).json(group);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const group = await db.group.delete({
      where: { id: id as string },
    });

    res.status(200).json(group);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Kelompok tidak ditemukan" });
      } else if (err.code == "P2003") {
        res.status(400).json({ error: "Kelompok mempunyai anggota" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export const deleteGroups = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const groups = await db.group.deleteMany({
      where: { id: { in: ids } },
    });

    res.status(200).json(groups);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Kelompok tidak ditemukan" });
      } else if (err.code == "P2003") {
        res.status(400).json({ error: "Kelompok mempunyai anggota" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

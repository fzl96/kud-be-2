import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const signIn = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
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
      },
    });

    if (!user) {
      res.status(400).json({ error: "Username atau password salah" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Username atau password salah" });
      return;
    }

    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: {
        name: user.role.name,
      },
    };

    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "1800s",
      }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    console.log(accessToken);
    console.log(refreshToken);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });
    } catch (err) {
      console.log(err);
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
    });
    res.json({ accessToken });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ error: err.message });
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { refreshToken },
      include: { role: true },
    });

    if (!user) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      (err: any, user: any) => {
        if (err) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        const payload = {
          id: user.id,
          name: user.name,
          username: user.username,
          role: {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
          },
        };

        const accessToken = jwt.sign(
          payload,
          process.env.ACCESS_TOKEN_SECRET as string,
          {
            expiresIn: "1800s",
          }
        );

        res.json({ accessToken });
      }
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ error: err.message });
    }
  }
};

export const signOut = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  console.log(refreshToken);

  if (!refreshToken) res.sendStatus(204);

  try {
    const user = await prisma.user.update({
      where: { refreshToken },
      data: { refreshToken: null },
    });

    if (!user) {
      console.log("no user");
      res.sendStatus(204);
    }

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout berhasil" });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(500).json({ error: err.message });
    }
  }
};

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

(async () => {
  // const rolesToAdd = ["Admin", "Kasir", "Bendahara", "Ketua"];

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("kawaii", salt);

  const user = await prisma.user.create({
    data: {
      name: "Pozyomka",
      username: "pozy",
      password: hashedPassword,
      roleId: "clj0kc96q00004fusfi4e71c9",
    },
  });

  console.log(user);

  // const user = await prisma.user.findUnique({
  //   where: { username: "pozy" },
  // });

  // await prisma.user.delete({
  //   where: { id: user?.id },
  // });
})();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

(async () => {
  const categories = await prisma.category.findMany();

  if (categories.length === 0) {
    return;
  }

  const data = [
    {
      name: "Kapas Selection",
      category: "Kosmetik",
      barcode: "8991038110354",
      price: 5000,
      stock: 10,
    },
    {
      name: "Parfum Brasov Ruby",
      category: "Kosmetik",
      barcode: "8997008673041",
      price: 25000,
      stock: 5,
    },
    {
      name: "Pantene Conditioner Perfect On",
      category: "Kosmetik",
      barcode: "4902430832748",
      price: 18000,
      stock: 10,
    },
    {
      name: "Nivea Extra White Body Serum",
      category: "Kosmetik",
      barcode: "4005808713257",
      price: 43000,
      stock: 8,
    },
    {
      name: "Garnier Micellar Water Vitamin C 125 ml",
      category: "Kosmetik",
      barcode: "8994993013845",
      price: 28000,
      stock: 5,
    },
    {
      name: "Posh Deodorant Whitening",
      category: "Kosmetik",
      barcode: "8998866107938",
      price: 18000,
      stock: 8,
    },
    {
      name: "Ellips Smooth & Silky",
      category: "Kosmetik",
      barcode: "8993417200076",
      price: 15000,
      stock: 5,
    },
    {
      name: "Vaseline UV extra Brightening 100 ml",
      category: "Kosmetik",
      barcode: "8999999719395",
      price: 21000,
      stock: 12,
    },
    {
      name: "Marina UV White 185 ml",
      category: "Kosmetik",
      barcode: "8999908082800",
      price: 10000,
      stock: 10,
    },
    {
      name: "Rexona Free Spirit",
      category: "Kosmetik",
      barcode: "8999999049454",
      price: 17000,
      stock: 15,
    },
    {
      name: "Sapu garuk lava",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "9555047300282",
      price: 37000,
      stock: 9,
    },
    {
      name: "Sikat WC Hawaii",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "8992830170478",
      price: 27000,
      stock: 6,
    },
    {
      name: "Sapu Cheetah Dragon",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "8997228591620",
      price: 35000,
      stock: 8,
    },
    {
      name: "Sapu Taiwan Dragon",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "8997228591385",
      price: 26000,
      stock: 20,
    },
    {
      name: "Pel Dragon",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "8997228592771",
      price: 35000,
      stock: 17,
    },
    {
      name: "Spons Cuci Piring Bagus",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "8886020225171",
      price: 11000,
      stock: 25,
    },
    {
      name: "Sabut Stainless Scotch Brite",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "8992806670056",
      price: 8000,
      stock: 25,
    },
    {
      name: "Spons Cuci Piring Scotch Brite",
      category: "Bahan dan Peralatan Perawatan Rumah",
      barcode: "8992806816836",
      price: 15000,
      stock: 25,
    },
    {
      name: "Stop Kontak 6 Kenmaster",
      category: "Alat Elektronik",
      barcode: "4719920080646",
      price: 87000,
      stock: 7,
    },
    {
      name: "Stop Kontak 4 Broco",
      category: "Alat Elektronik",
      barcode: "8997022280553",
      price: 58000,
      stock: 10,
    },
    {
      name: "Lampu Hannochs 9W",
      category: "Alat Elektronik",
      barcode: "6945082409614",
      price: 25000,
      stock: 18,
    },
    {
      name: "Lampu Hannochs 15W",
      category: "Alat Elektronik",
      barcode: "6945082409638",
      price: 37000,
      stock: 20,
    },
    {
      name: "Lampu Philips 8W",
      category: "Alat Elektronik",
      barcode: "8718696822883",
      price: 47000,
      stock: 20,
    },
    {
      name: "Lampu LED Panasonic",
      category: "Alat Elektronik",
      barcode: "8997207611271",
      price: 53000,
      stock: 5,
    },
    {
      name: "Setrika Maspion",
      category: "Alat Elektronik",
      barcode: "8990011110527",
      price: 190000,
      stock: 3,
    },
    {
      name: "Kabel USB CK-111-TYP",
      category: "Alat Elektronik",
      barcode: "6973143493678",
      price: 11000,
      stock: 5,
    },
    {
      name: "Colokan Loyal LY-922 SK",
      category: "Alat Elektronik",
      barcode: "8993229922005",
      price: 23000,
      stock: 5,
    },
    {
      name: "Raket Nyamuk Kenmaster",
      category: "Alat Elektronik",
      barcode: "4719920030108",
      price: 100000,
      stock: 6,
    },
  ];

  const dataWithCategoryId = data.map((item) => {
    const category = categories.find(
      (category) => category.name === item.category
    );
    if (!category) {
      throw new Error(`Category ${item.category} not found`);
    }

    return {
      name: item.name,
      barcode: item.barcode,
      price: item.price,
      stock: item.stock,
      categoryId: category.id,
    };
  });

  const itemsCreated = await prisma.product.createMany({
    data: dataWithCategoryId,
  });

  console.log(itemsCreated);

  // console.log(categoriesCreated);
})();

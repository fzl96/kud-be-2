import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../lib/db";

const productSchema = z.object({
  id: z.string().optional(),
  quantity: z.number().min(0).optional(),
});

export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await db.sale.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        total: true,
        paymentMethod: true,
        dueDate: true,
        status: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(200).json(sales);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const getSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sale = await db.sale.findUnique({
      where: { id: id as string },
      include: {
        products: {
          select: {
            quantity: true,
            productId: true,
            total: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.status(200).json({
      id: sale?.id,
      customer: sale?.customer,
      total: sale?.total,
      cash: sale?.cash,
      change: sale?.change,
      paymentMethod: sale?.paymentMethod,
      status: sale?.status,
      dueDate: sale?.dueDate,
      products: sale?.products.map((product) => ({
        id: product.productId,
        quantity: product.quantity,
        name: product.product.name,
        total: product.total,
      })),
      cashier: sale?.user,
      createdAt: sale?.createdAt,
      updatedAt: sale?.updatedAt,
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      products,
      cash,
      change,
      cashierId,
      status,
      paymentMethod,
      dueDate,
    } = req.body;
    // check if customer and products exist in the request body
    if (!products || !cashierId) {
      console.log(products, cashierId);
      res.status(400).json({ error: "Data kurang lengkap" });
      return;
    }

    const isProductValid = products.every(
      (product: any) => productSchema.safeParse(product).success
    );

    // check if the products are valid
    if (!isProductValid) {
      res.status(400).json({ error: isProductValid.error.issues });
      return;
    }

    // get the price of the products
    const productPrices = await db.product.findMany({
      where: {
        id: {
          in: products.map((product: any) => product.id),
        },
      },
      select: {
        id: true,
        price: true,
        stock: true,
      },
    });

    // check if the product is in stock
    const isProductInStock = products.every(
      (product: any) =>
        productPrices.find((p) => p.id === product.id)?.stock! >=
        product.quantity
    );

    if (!isProductInStock) {
      res.status(400).json({ error: "Stok tidak cukup" });
      return;
    }

    const total = products.reduce(
      (acc: number, product: any) =>
        acc +
        productPrices.find((p) => p.id === product.id)?.price! *
          product.quantity,
      0
    );

    if (cash) {
      if (total > cash) {
        res.status(400).json({ error: "Uang tidak cukup" });
        return;
      }
    }

    const createData: Prisma.SaleCreateInput = {
      cash,
      change,
      paymentMethod,
      status,
      dueDate,
      total: total,
      user: { connect: { id: cashierId } },
      products: {
        create: products.map((product: any) => ({
          quantity: product.quantity,
          productId: product.id,
          // multiply the price of the product by the quantity
          total:
            productPrices.find((p) => p.id === product.id)?.price! *
            product.quantity,
        })),
      },
    };

    if (customerId) createData.customer = { connect: { id: customerId } };

    // create the sale
    const sale = db.sale.create({
      data: createData,
    });

    const result = await db.$transaction([
      sale,
      ...products.map((product: any) => {
        return db.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: product.quantity,
            },
          },
        });
      }),
    ]);

    res.status(201).json("Penjualan berhasil ditambahkan");
  } catch (err) {
    console.log(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(404).json({ error: "Customer tidak ditemukan" });
        return;
      } else {
        if (err instanceof Error) {
          res.status(500).json({ error: err.message });
        }
      }
    }
  }
};

export const updateSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  // const { customerId, products } = req.body;
  // try {
  //   // get the price of the products
  //   const productPrices = await db.product.findMany({
  //     where: {
  //       id: {
  //         in: products.map((product: any) => product.id),
  //       },
  //     },
  //     select: {
  //       id: true,
  //       price: true,
  //     },
  //   });

  //   const sale = db.sale.update({
  //     where: { id: id as string },
  //     data: {
  //       customer: { connect: { id: customerId } },
  //       total: products.reduce(
  //         (acc: number, product: any) =>
  //           acc +
  //           productPrices.find((p) => p.id === product.id)?.price! *
  //             product.quantity,
  //         0
  //       ),
  //     },
  //   });

  //   const existingProductSale = await db.productSale.findMany({
  //     where: {
  //       saleId: id,
  //     },
  //   });

  //   const productSaleIds = products.map((product: any) => product.id);

  //   const deleteProductSale = db.productSale.deleteMany({
  //     where: {
  //       productId: {
  //         notIn: productSaleIds,
  //       },
  //       saleId: id,
  //     },
  //   });

  //   const updateProductSale = existingProductSale.filter((productSale) =>
  //     productSaleIds.includes(productSale.productId)
  //   );
  //   // get the products that are not in the database in exisstinProductSale
  //   const createProductSales = products.filter(
  //     (product: any) =>
  //       !existingProductSale
  //         .map((productSale) => productSale.productId)
  //         .includes(product.id)
  //   );

  //   const saleResult = await db.$transaction([
  //     sale,
  //     deleteProductSale,
  //     ...updateProductSale.map((productSale) =>
  //       db.productSale.update({
  //         where: {
  //           saleId_productId: {
  //             saleId: productSale.saleId,
  //             productId: productSale.productId,
  //           },
  //         },
  //         data: {
  //           quantity: productSale.quantity,
  //           total: productSale.total,
  //         },
  //       })
  //     ),
  //     ...createProductSales.map((productSale: any) => {
  //       db.productSale.create({
  //         data: {
  //           quantity: productSale.quantity,
  //           productId: productSale.id,
  //           saleId: id,
  //           total:
  //             productPrices.find((p) => p.id === productSale.id)?.price! *
  //             productSale.quantity,
  //         },
  //       });
  //     }),
  //   ]);
  //   res.status(200).json(saleResult[0]);
  // } catch (err) {
  //   if (err instanceof Error) {
  //     console.log(err.message);

  //     res.status(500).json({ error: err.message });
  //   }
  // }
  res.status(400).json({ error: "Data penjualan tidak bisa diubah" });
};

export const deleteSale = async (id: string) => {
  // get the products in the sale
  const products = await db.productSale.findMany({
    where: {
      saleId: id,
    },
  });

  // get the quantity of the products
  const productQuantity = products.map((product) => ({
    id: product.productId,
    quantity: product.quantity,
  }));

  // delete the sale and all the items
  const productSale = db.productSale.deleteMany({
    where: {
      saleId: id,
    },
  });

  const sale = db.sale.delete({
    where: { id: id },
  });

  const [saleDeleted, productSaleDeleted] = await db.$transaction([
    productSale,
    sale,
    ...productQuantity.map((product) => {
      return db.product.update({
        where: { id: product.id },
        data: {
          stock: {
            increment: product.quantity,
          },
        },
      });
    }),
  ]);
  return { message: "Purchase deleted" };
};

export const deleteSales = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    const result = await Promise.all(ids.map((id: string) => deleteSale(id)));
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        res.status(400).json({ error: "Data tidak ditemukan" });
        return;
      } else {
        res.status(500).json({ error: err.message });
        return;
      }
    }
  }
};

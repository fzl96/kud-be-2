import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const createProduct = () => {
  describe("POST /products", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).post("/categories");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika nama produk kosong ", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "",
              price: 10000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika harga produk kosong ", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Taro",
              price: "",
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika barcode produk kosong ", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Taro",
              price: 10000,
              stock: 10,
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika kategori id produk kosong ", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Taro",
              price: 10000,
              stock: 10,
              barcode: "1234567891234",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika kategori id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Taro",
              price: 10000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "123456",
            });
          expect(res.status).toBe(404);
        });
      });

      describe("Jika nama produk sudah ada", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Beng-beng",
              price: 10000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama produk tidak valid (bukan string)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: 123,
              price: 10000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama produk tidak valid (kurang dari 3 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "aa",
              price: 10000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama produk tidak valid (lebih dari 50 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "a".repeat(51),
              price: 10000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika harga produk tidak valid (bukan number)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Taro",
              price: "10000",
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika harga produk tidak valid (kurang dari 1)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .send({
              name: "Taro",
              price: -1000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            })
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(400);
        });
      });

      describe("Jika stock produk tidak valid (bukan number)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .send({
              name: "Taro",
              price: 10000,
              stock: "10",
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            })
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(400);
        });
      });

      describe("Jika stock produk tidak valid (kurang dari 1)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .send({
              name: "Taro",
              price: 10000,
              stock: -10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            })
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(400);
        });
      });

      describe("Jika barcode produk tidak valid (bukan string)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/products")
            .send({
              name: "Taro",
              price: 10000,
              stock: 10,
              barcode: 1234567891234,
              categoryId: "clj0mgybi00004f5g9678m6b1",
            })
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(400);
        });
      });

      describe("Jika data produk valid", () => {
        it("respons harus 201 Created", async () => {
          const res = await request(app)
            .post("/products")
            .send({
              name: "Taro",
              price: 10000,
              stock: 10,
              barcode: "12345678912345",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            })
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(201);
        });
      });
    });
  });
};

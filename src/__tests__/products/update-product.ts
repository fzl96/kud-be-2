import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const updateProduct = () => {
  describe("PUT /products", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).post("/categories");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      let productId = "";
      beforeAll(async () => {
        const res = await request(app)
          .get("/products")
          .set("Authorization", `Bearer ${jwt}`);
        productId = res.body.find((product: any) => product.name === "Taro").id;
      });

      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .put("/products/666")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Taro",
              price: 20000,
              stock: 10,
              barcode: "1234567891234",
              categoryId: "clj0mgybi00004f5g9678m6b1",
            });
          expect(res.status).toBe(404);
        });
      });

      describe("Jika id ditemukan", () => {
        describe("Jika nama produk kosong ", () => {
          it("Respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/products/${productId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({
                name: "",
                price: 20000,
                stock: 10,
                barcode: "1234567891234",
                categoryId: "clj0mgybi00004f5g9678m6b1",
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika harga produk kosong ", () => {
          it("Respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/products/${productId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({
                name: "Taro",
                stock: 10,
                barcode: "1234567891234",
                categoryId: "clj0mgybi00004f5g9678m6b1",
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika barcode produk kosong ", () => {
          it("Respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/products/${productId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({
                name: "Taro",
                price: 20000,
                stock: 10,
                categoryId: "clj0mgybi00004f5g9678m6b1",
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika kategori id produk kosong ", () => {
          it("Respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/products/${productId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({
                name: "Taro",
                price: 20000,
                stock: 10,
                barcode: "1234567891234",
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika semua data produk kosong ", () => {
          it("Respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/products/${productId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({
                name: "",
                price: "",
                stock: "",
                barcode: "",
                categoryId: "",
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika semua data produk terisi ", () => {
          it("Respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/products/${productId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({
                name: "Chitatos",
                price: 20000,
                stock: 10,
                barcode: "987654321",
                categoryId: "clj0mgybi00004f5g9678m6b1",
              });
            expect(res.status).toBe(200);
          });
        });
      });
    });
  });
};

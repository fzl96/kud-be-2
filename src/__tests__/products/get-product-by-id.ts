import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const getProduct = () => {
  return describe("GET /product/:id", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).get("/products");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .get("/products/999")
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(404);
        });
      });

      describe("Jika id ditemukan", () => {
        let productId: string;
        beforeAll(async () => {
          const res = await request(app)
            .get("/products")
            .set("Authorization", `Bearer ${jwt}`);
          productId = res.body.find(
            (product: any) => product.name === "Taro"
          ).id;
        });

        it("Respons harus 200 OK", async () => {
          const res = await request(app)
            .get(`/products/${productId}`)
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(200);
        });

        // it("respons harus berisi objek dengan property yang valid (memiliki id, name, createdAt, updatedAt)", async () => {
        //   const res = await request(app)
        //     .get(`/products/${productId}`)
        //     .set("Authorization", `Bearer ${jwt}`);
        //   expect(res.body).toEqual({
        //     id: expect.any(String),
        //     name: expect.any(String),
        //     createdAt: expect.any(String),
        //     updatedAt: expect.any(String),

        //   });
        // });
      });
    });
  });
};

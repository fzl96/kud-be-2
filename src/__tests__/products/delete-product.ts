import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const deleteProduct = () => {
  return describe("DELETE /products/:id", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).delete("/products/1");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .delete("/products/999")
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
            (product: any) => product.name === "Chitatos"
          ).id;
        });

        it("respons harus 200 OK", async () => {
          const res = await request(app)
            .delete(`/products/${productId}`)
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(200);
        });
      });
    });
  });
};

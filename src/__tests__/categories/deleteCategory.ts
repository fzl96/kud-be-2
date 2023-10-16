import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const deleteCategory = () => {
  return describe("DELETE /categories/:id", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).delete("/categories/1");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .delete("/categories/999")
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(404);
        });
      });

      describe("Jika id ditemukan", () => {
        let CategoryIdWithoutProducts: string;
        let CategoryIdWithProducts: string;
        beforeAll(async () => {
          const res = await request(app)
            .get("/categories")
            .set("Authorization", `Bearer ${jwt}`);

          const categories: {
            id: string;
            name: string;
            createdAt: string;
            updatedAt: string;
          }[] = res.body.data;
          CategoryIdWithProducts = res.body.data.find(
            (category: any) => category.name === "Makanan"
          ).id;
          CategoryIdWithoutProducts = res.body.data.find(
            (category: any) => category.name === "Test Update"
          ).id;
        });

        describe("Jika kategori memiliki produk", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .delete(`/categories/${CategoryIdWithProducts}`)
              .set("Authorization", `Bearer ${jwt}`);
            expect(res.status).toBe(400);
          });
        });

        describe("Jika kategori tidak memiliki produk", () => {
          it("respons harus 200 OK", async () => {
            const res = await request(app)
              .delete(`/categories/${CategoryIdWithoutProducts}`)
              .set("Authorization", `Bearer ${jwt}`);
            expect(res.status).toBe(204);
          });
        });
      });
    });
  });
};

import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const updateCategory = () => {
  describe("PUT /categories/:id", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).put("/categories/1");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .put("/categories/999")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "Test" });
          expect(res.status).toBe(404);
        });
      });

      describe("Jika id ditemukan", () => {
        let CategoryId: string;
        beforeAll(async () => {
          const res = await request(app)
            .get("/categories")
            .set("Authorization", `Bearer ${jwt}`);
          CategoryId = res.body.data.find(
            (category: any) => category.name === "Unit Test Kategori"
          ).id;
        });

        describe("Jika nama kategori kosong ", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/categories/${CategoryId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ name: "" });
            expect(res.status).toBe(400);
          });
        });

        describe("Jika nama kategori sudah ada", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/categories/${CategoryId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ name: "Minuman" });
            expect(res.status).toBe(400);
          });
        });

        describe("Jika nama kategori tidak valid (bukan string)", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/categories/${CategoryId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ name: 123 });
            expect(res.status).toBe(400);
          });
        });

        describe("Jika nama kategori tidak valid (kurang dari 3 karakter)", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/categories/${CategoryId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ name: "aa" });
            expect(res.status).toBe(400);
          });
        });

        describe("Jika nama kategori tidak valid (lebih dari 50 karakter)", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/categories/${CategoryId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({
                name: "a".repeat(51),
              });
            expect(res.status).toBe(400);
          });
        });

        describe("Jika nama kategori valid", () => {
          it("respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/categories/${CategoryId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ name: "Test Update" });
            expect(res.status).toBe(200);
          });
        });
      });
    });
  });
};

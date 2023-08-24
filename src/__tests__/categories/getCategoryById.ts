import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const getCategory = () => {
  return describe("GET /categories/:id", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).get("/categories");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .get("/categories/999")
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(404);
        });
      });

      describe("Jika id ditemukan", () => {
        let CategoryId: string;
        beforeAll(async () => {
          const res = await request(app)
            .get("/categories")
            .set("Authorization", `Bearer ${jwt}`);
          CategoryId = res.body[0].id;
        });

        it("respons harus berisi objek dengan property yang valid (memiliki id, name, createdAt, updatedAt)", async () => {
          const res = await request(app)
            .get(`/categories/${CategoryId}`)
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.body).toEqual({
            id: expect.any(String),
            name: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          });
        });
      });
    });
  });
};

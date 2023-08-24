import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const createCategory = () => {
  return describe("POST /categories", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).post("/categories");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika nama kategori kosong ", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "" });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama kategori sudah ada", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "Makanan" });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama kategori tidak valid (bukan string)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: 123 });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama kategori tidak valid (kurang dari 3 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "aa" });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama kategori tidak valid (lebih dari 50 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "a".repeat(51) });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama kategori yang dikirim valid", () => {
        it("respons harus 201 Created", async () => {
          const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "Test" });
          expect(res.status).toBe(201);
        });

        it("respons harus berisi objek dengan property yang valid (memiliki id, name, createdAt, updatedAt)", async () => {
          const res = await request(app)
            .post("/categories")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "Kategori Baru" });
          console.log(res.body);
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

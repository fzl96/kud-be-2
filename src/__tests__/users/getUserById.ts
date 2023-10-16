import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const getUserById = () => {
  return describe("GET /users/:id", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).get("/users/1");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .get("/users/999")
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(404);
        });
      });

      describe("Jika id ditemukan", () => {
        let UserId: string;
        beforeAll(async () => {
          const res = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${jwt}`);
          UserId = res.body.data.find(
            (user: any) => user.username === "jestest"
          ).id;
        });

        it("respons harus 200 OK", async () => {
          const res = await request(app)
            .get(`/users/${UserId}`)
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.status).toBe(200);
        });

        it("respons harus berisi objek dengan property yang valid (memiliki id, username, role, createdAt, updatedAt)", async () => {
          const res = await request(app)
            .get(`/users/${UserId}`)
            .set("Authorization", `Bearer ${jwt}`);
          expect(res.body).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            username: expect.any(String),
            role: {
              id: expect.any(String),
              name: expect.any(String),
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          });
        });
      });
    });
  });
}
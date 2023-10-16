import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const getCategories = () => {
  return describe("GET /categories", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).get("/categories");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      it("respons harus 200 OK", async () => {
        const res = await request(app)
          .get("/categories")
          .set("Authorization", `Bearer ${jwt}`);
        expect(res.status).toBe(200);
      });

      it("respons harus berisi objek pagination dan array data", async () => {
        const res = await request(app)
          .get("/categories")
          .set("Authorization", `Bearer ${jwt}`);
        expect(res.body).toEqual(expect.objectContaining({
          pagination: expect.any(Object),
          data: expect.any(Array),
        }));
      });
    });
  });
};

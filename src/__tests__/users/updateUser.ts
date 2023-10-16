import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const updateUser = () => {
  return describe("PUT /users/:id", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).put("/users/1");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika id tidak ditemukan", () => {
        it("respons harus 404 Not Found", async () => {
          const res = await request(app)
            .put("/users/999")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ name: "Test" });
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

        describe("Jika nama pengguna kosong", () => {
          it("respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/users/${UserId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ 
                name: "Test Update",
                username: "", 
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika nama pengguna sudah ada", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/users/${UserId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ 
                name: "Test",
                username: "admin", 
              });
            expect(res.status).toBe(400);
          });
        });

        describe("Jika password kosong", () => {
          it("respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/users/${UserId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ 
                name: "Test Update 2",
                username: "jestest", 
                newPassword: "", 
                confirmPassword: "", 
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika password tidak sama", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/users/${UserId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ 
                newPassword: "1234567", 
                confirmPassword: "7654321",
                currentPassword: "123456"
              });
            expect(res.status).toBe(400);
          });
        });

        describe("Jika password lama tidak cocok dengan yang ada di database", () => {
          it("respons harus 400 Bad Request", async () => {
            const res = await request(app)
              .put(`/users/${UserId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ 
                newPassword: "1234567", 
                confirmPassword: "1234567", 
                currentPassword: "12345" 
              });
            expect(res.status).toBe(400);
          });
        })

        describe("Jika role id kosong", () => {
          it("respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/users/${UserId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ 
                name: "Test update 3",
                username: "jestest", 
                roleId: "" 
              });
            expect(res.status).toBe(200);
          });
        });

        describe("Jika data valid", () => {
          it("respons harus 200 OK", async () => {
            const res = await request(app)
              .put(`/users/${UserId}`)
              .set("Authorization", `Bearer ${jwt}`)
              .send({ 
                name: "Test Update final",
                username: "jestest", 
                password: "1234567", 
                confirmPassword: "1234567", 
                roleId: "clj0kc96q00004fusfi4e71c9" 
              });
            expect(res.status).toBe(200);
          });
        });
      });
  
    });
})};
     
import request from "supertest";
import app from "../../app.js";
import { userPayload } from "../../lib/payload.js";
import { signJwt } from "../../utils/jwt.js";

export const createUser = () => {
  return describe("POST /users", () => {
    describe("Jika pengguna belum login", () => {
      it("respons harus 401 Unauthorized", async () => {
        const res = await request(app).post("/users");
        expect(res.status).toBe(401);
      });
    });

    describe("Jika pengguna sudah login", () => {
      const jwt = signJwt(userPayload.admin);
      describe("Jika nama pengguna kosong", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ 
              name: "Test",
              username: "", 
              password: "123456", 
              confirmPassword: "123456", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama pengguna sudah ada", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ 
              name: "Test",
              username: "admin", 
              password: "123456", 
              confirmPassword: "123456", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        });
      });


      describe("Jika nama pengguna tidak valid (kurang dari 4 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ 
              name: "Test",
              username: "aaa", 
              password: "123456", 
              confirmPassword: "123456", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika nama pengguna tidak valid (lebih dari 50 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ 
              name: "Test",
              username: "a".repeat(51), 
              password: "123456", 
              confirmPassword: "123456", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        }
      );
    }
  );
      describe("Jika kata sandi kosong", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ 
              name: "Test",
              username: "jestest", 
              password: "", 
              confirmPassword: "", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika kata sandi tidak sama dengan konfirmasi kata sandi", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ 
              name: "Test",
              username: "jestest", 
              password: "123456", 
              confirmPassword: "1234567", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika kata sandi tidak valid (kurang dari 4 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({ 
              name: "Test",
              username: "jestest", 
              password: "123", 
              confirmPassword: "12345", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika kata sandi tidak valid (lebih dari 50 karakter)", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Test",
              username: "jestest",
              password: "a".repeat(51),
              confirmPassword: "12345", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(400);
        });
      });

      describe("Jika role kosong", () => {
        it("respons harus 400 Bad Request", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Test",
              username: "jestest",
              password: "123456",
              confirmPassword: "123456",
              roleId: "",
            });
          expect(res.status).toBe(400);
        });
      });
       
      describe("Jika pengguna berhasil dibuat", () => {
        it("respons harus 201 Created", async () => {
          const res = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${jwt}`)
            .send({
              name: "Test",
              username: "jestest",
              password: "123456" ,
              confirmPassword: "123456", 
              roleId: "clj0kc96q00004fusfi4e71c9" 
            });
          expect(res.status).toBe(201);
        });
      });
    }
  );
})};

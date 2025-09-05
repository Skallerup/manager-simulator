import request from "supertest";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "../src/auth/routes";
import { prisma } from "../src/prisma/client";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Routes", () => {
  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: userData.name,
      });
      expect(response.body.passwordHash).toBeUndefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
      expect(user?.name).toBe(userData.name);
      expect(user?.passwordHash).toBeTruthy();
      expect(user?.passwordHash).not.toBe(userData.password);
    });

    it("should reject registration with invalid email", async () => {
      const userData = {
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe("Invalid input");
    });

    it("should reject registration with short password", async () => {
      const userData = {
        email: "test@example.com",
        password: "123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe("Invalid input");
    });

    it("should reject registration with duplicate email", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "password123",
        name: "Test User",
      };

      // First registration should succeed
      await request(app).post("/auth/register").send(userData).expect(201);

      // Second registration with same email should fail
      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe("Email already in use");
    });

    it("should register user without name", async () => {
      const userData = {
        email: "noname@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: null,
      });
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app).post("/auth/register").send({
        email: "login@example.com",
        password: "password123",
        name: "Login User",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const loginData = {
        email: "login@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: loginData.email,
        name: "Login User",
      });

      // Check that cookies are set
      const cookies = response.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes("access_token"))
      ).toBe(true);
      expect(
        cookies.some((cookie: string) => cookie.includes("refresh_token"))
      ).toBe(true);
    });

    it("should reject login with incorrect password", async () => {
      const loginData = {
        email: "login@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should reject login with non-existent email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should reject login with invalid email format", async () => {
      const loginData = {
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe("Invalid credentials");
    });
  });

  describe("GET /auth/me", () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get tokens
      await request(app).post("/auth/register").send({
        email: "me@example.com",
        password: "password123",
        name: "Me User",
      });

      const loginResponse = await request(app).post("/auth/login").send({
        email: "me@example.com",
        password: "password123",
      });

      // Extract access token from cookies
      const cookies = loginResponse.headers[
        "set-cookie"
      ] as unknown as string[];
      const accessCookie = cookies.find((cookie: string) =>
        cookie.includes("access_token")
      );
      accessToken = accessCookie?.split(";")[0]?.split("=")[1] || "";
    });

    it("should return user info with valid access token", async () => {
      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", `access_token=${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: "me@example.com",
        name: "Me User",
      });
    });

    it("should reject request without access token", async () => {
      const response = await request(app).get("/auth/me").expect(401);

      expect(response.body.error).toBe("Unauthenticated");
    });
  });
});

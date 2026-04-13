import request from "supertest"
import { describe, it, expect } from "vitest"
import { app } from "../../app"
import { seedAdminUser } from "../../db/seed";
import { signAccessToken } from "../../utils/jwt";
import { UserRow } from "../../types/user";

describe("GET /health", () => {

    it("returns 200 with ok: true", async () => {
        const response = await request(app).get("/health")

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ok: true })
    });
});

describe("GET /users/me", () => {

    it("returns 401 unauthorized", async () => {
        const response = await request(app).get("/users/me")
        expect (response.status).toBe(401);
    })

    it("returns 200 with authenticated user's data", async () => {
        // seed test db
        const user: UserRow = await seedAdminUser();
        const token = signAccessToken({
            sub: user.id,
            role: user.role,
            email: user.email,
        })
        const response = await request(app)
            .get("/users/me")
            .auth(token, { type: "bearer" });

        expect(response.status).toBe(200);
    })
})


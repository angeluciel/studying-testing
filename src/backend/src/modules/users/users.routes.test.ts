import request from "supertest"
import { describe, it, expect } from "vitest"
import { app } from "../../app"

describe("GET /health", () => {

    it("returns 200 with ok: true", async () => {
        const response = await request(app).get("/health")

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ok: true })
    });
});

describe("GET /users/me", () => {

    it("returns")
})

// TODO: create a test database
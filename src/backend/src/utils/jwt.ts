import jwt from "jsonwebtoken"
import { env } from "../config/env";

export type JwtPayload = {
    sub: string;
    role: "admin" | "user";
    email: string;
};

export function signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
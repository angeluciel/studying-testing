import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8, { error: "Password too short." }),
})

const requestPasswordChangeSchema = z.object({
    email: z.email(),
});

const changePasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8),
})

export async function login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.password);
    return res.json(result);
}

export async function requestPasswordChange(req: Request, res: Response) {
    const body = requestPasswordChangeSchema.parse(req.body);
    await authService.requestPasswordChange(body.email);
    return res.json({
        message: "if the account exists, a password change email was sent",
    });
}

export async function changePassword(req: Request, res: Response) {
    const body = changePasswordSchema.parse(req.body);
    await authService.changePassword(body.token, body.newPassword);
    return res.json({ message: "Password updated successfully" });
}
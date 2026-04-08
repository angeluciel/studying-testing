import { Request, Response } from "express";
import { z } from "zod";
import * as usersService from "./users.service";

const createUserSchema = z.object({
    email: z.email(),
    name: z.string().min(1),
    surname: z.string().min(1),
    password: z.string().min(8),
    role: z.enum(["admin", "user"]).optional(),
});

const updateMeSchema = z.object({
    name: z.string().min(1).optional(),
    surname: z.string().min(1).optional(),
});

export async function createUser(req: Request, res: Response) {
    const body = createUserSchema.parse(req.body);
    const user = await usersService.createUser(body);
    return res.status (201).json(user);
}

export async function getMe(req: Request, res: Response) {
    const user = await usersService.getMe(req.user!.id);
    return res.json(user);;
}

export async function updateMe(req: Request, res: Response) {
    const body = updateMeSchema.parse(req.body);
    const user = await usersService.updateMe(req.user!.id, body);
    return res.json(user);
}

export async function deleteUser(req: Request<{ id: string }>, res: Response) {
    const targetUserId = req.params.id;

    if (req.user!.role !== "admin" && req.user!.id !== targetUserId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await usersService.deleteUser(targetUserId);
    return res.status(204).send();
}
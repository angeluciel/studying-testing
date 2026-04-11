import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as usersService from "./users.service";
import { AppError } from "../../middlewares/error.middleware";

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
    return res.status(201).json(user);
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await usersService.getMe(req.user!.id);

        if (!user) {
            return next(new AppError(404, "User not found"));
        }

        return res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
    try {
        const body = updateMeSchema.parse(req.body);
        const user = await usersService.updateMe(req.user!.id, body);
        return res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function deleteUser(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const targetUserId = req.params.id;

        if (req.user!.role !== "admin" && req.user!.id !== targetUserId) {
            return next(new AppError(403, "Forbidden"));
        }

        await usersService.deleteUser(targetUserId);

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}
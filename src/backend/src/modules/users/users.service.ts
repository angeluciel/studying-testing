import { pool } from "../../db/pool";
import { hashPassword } from "../../utils/password";
import { sendMailWithTemplate } from "../../utils/mail";
import { WelcomeEmail } from "../../emails/WelcomeEmail";
import { env } from "../../config/env";

type CreateUserInput = {
    email: string;
    name: string;
    surname: string;
    password: string;
    role?: "admin" | "user";
};

export async function createUser(input: CreateUserInput) {
    const passwordhash = await hashPassword(input.password);

    const result = await pool.query(
        `insert into public.users (email, name, surname, password_hash, role)
        values ($1, $2, $3, $4, $5)
        returning id, email, name, surname, role, email_confirmed, is_active, created_at`,
        [
            input.email.toLowerCase(),
            input.name,
            input.surname,
            passwordhash,
            input.role ?? "user",
        ]
    );

    const user = result.rows[0];

    await sendMailWithTemplate(
        user.email,
        "Welcome — your account is ready",
        WelcomeEmail({
            name: user.name,
            email: user.email,
            tempPassword: input.password,
            loginUrl: `${env.APP_BASE_URL}/login`,
        })
    );

    return user;
}

export async function getMe(userId: string) {
    const result = await pool.query(
        `select id, email, name, surname, role, email_confirmed, is_active, created_at
        from public.users
        where id = $1`,
        [userId]
    );

    return result.rows[0] ?? null;
}

export async function updateMe(
    userId: string,
    data: { name?: string; surname?: string }
) {
    const current = await pool.query(
        `select id, name, surname from public.users where id = $1`,
        [userId]
    );

    const user = current.rows[0];
    if (!user) throw new Error("User not found");

    const result = await pool.query(
        `update users
        set name = $1,
        surname = $2
        where id = $3
        returning id, email, name, surname, role, email_confirmed, is_active, created_at`,
        [
            data.name ?? user.name,
            data.surname ?? user.surname,
            userId,
        ]
    );

    return result.rows[0];
}

export async function deleteUser(targetUserId: string) {
    await pool.query(`delete from public.users where id = $1`, [targetUserId]);
}
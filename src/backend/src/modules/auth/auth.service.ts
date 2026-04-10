import { pool } from "../../db/pool";
import { comparePassword, hashPassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { generateRawToken, hashToken } from "../../utils/tokens";
import { sendMailWithTemplate } from "../../utils/mail";
import { PasswordResetEmail } from "../../emails/PasswordResetEmail";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/error.middleware";

export async function login(email: string, password: string) {
    const result = await pool.query(
        `select id, email, password_hash, role, is_active
        from public.users
        where email = $1`,
        [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) throw new AppError(401, "Invalid credentials");
    if (!user.is_active) throw new AppError(401, "Invalid credentials");

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
    });

    return { accessToken };
}

export async function requestPasswordChange(email: string) {
    const result = await pool.query(
        `select id, email, name from public.users where email = $1`,
        [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) return;

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    await pool.query(
        `insert into password_change_tokens (user_id, token_hash, expires_at)
        values ($1, $2, now() + interval '30 minutes')`,
        [user.id, tokenHash]
    );

    const resetLink = `${env.APP_BASE_URL}/reset-password?token=${rawToken}`;

    await sendMailWithTemplate(
        user.email,
        "Reset your password",
        PasswordResetEmail({ name: user.name, resetLink })
    );
}

export async function changePassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);

    const result = await pool.query(
        `select pct.id, pct.user_id
        from password_change_tokens pct
        where pct.token_hash = $1
        and pct.user_at is null
        and pct.expires_at > now()
        limit 1`,
        [tokenHash]
    );

    const row = result.rows[0];
    if (!row) throw new AppError(400, "Invalid or expired token");

    const passwordHash = await hashPassword(newPassword);

    await pool.query("begin");

    try {
        await pool.query(
            `update users
            set password_hash = $1
            where id = $2`,
            [passwordHash, row.user_id]
        );

        await pool.query(
            `update password_change_tokens
            set used_at = now()
            where id = $1`,
            [row.id]
        );

        await pool.query("commit");
    } catch (error) {
        await pool.query("rollback");
        throw error;
    }
}
import nodemailer, { TransportOptions } from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
}as TransportOptions);

export async function sendMail(to: string, subject: string, html: string) {
    await transporter.sendMail({
        from: env.MAIL_FROM,
        to,
        subject,
        html,
    })
}
import nodemailer, { TransportOptions } from "nodemailer";
import { env } from "../config/env";
import { ReactElement } from "react";
import { render } from "@react-email/components";

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

/**
 * Send email with react-email
 */

export async function sendMailWithTemplate(
    to: string,
    subject: string,
    template: ReactElement
) {
    const html = await render(template);

    await transporter.sendMail({
        from: env.MAIL_FROM,
        to,
        subject,
        html,
    });
}

export async function renderEmailTemplate(template: ReactElement): Promise<string> {
    return await render(template)
}
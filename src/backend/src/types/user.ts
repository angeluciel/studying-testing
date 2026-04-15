export type UserRow = {
    id: string;
    email: string;
    name: string;
    surname: string;
    role: "admin" | "user";
    email_confirmed: boolean;
    is_active: boolean;
    created_at: Date;
}
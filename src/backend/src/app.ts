import express  from "express";
import pinoHttp from "pino-http";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { logger } from "./utils/logger";

export const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

// TODO: ADD TRY/CATCH TO EVERY SERVICE

app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.use(errorMiddleware);
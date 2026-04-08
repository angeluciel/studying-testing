import { Router } from "express";
import * as controller from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", controller.login);
authRouter.post("/request-password-change", controller.requestPasswordChange);
authRouter.post("/change-password", controller.changePassword);
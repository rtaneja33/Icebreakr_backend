import { Router } from "express";
import { userRouter } from "./user";

const router: Router = Router();
userRouter(router);

export { router };

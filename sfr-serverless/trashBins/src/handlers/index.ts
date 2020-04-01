import { Router } from "express";
import { binRouter } from "./trashBin";

const router: Router = Router();
binRouter(router);

export { router };

import { Router } from "express";
import { searchRouter } from "./search";

const router: Router = Router();
searchRouter(router);

export { router };

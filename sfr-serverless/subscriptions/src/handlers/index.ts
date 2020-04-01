import { Router } from "express";
import { subscriptionRouter } from "./subscriptions";

const router: Router = Router();
subscriptionRouter(router);

export { router };

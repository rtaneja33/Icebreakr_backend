import * as express from "express";
import { initialApp } from "../../common/services";
import { router } from "./handlers";

const app: express.Express = express();
initialApp(app);

app.use("/", router);

export { app };

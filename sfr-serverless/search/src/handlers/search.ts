// tslint:disable max-file-line-count
import { Response, Router } from "express";
import {
  IRequest
} from "../../../common";

export function searchRouter(route: Router) {

  route.post("/me/test", test);
  
}

async function test(req: IRequest, res: Response) {
  return res.json(req.body);
}





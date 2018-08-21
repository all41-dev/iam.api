import { Router, Request, Response } from "express";
import {UsersApi} from "../users-api";

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
    UsersApi.model.user.all().then((users: any) => {
        res.send(users);
    });
});
console.log("registring example routes");
export const UsersController: Router = router;
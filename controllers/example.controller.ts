import { Router, Request, Response } from "express";

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    // Reply with a hello world when no name param is provided
    res.send('Hello from example controller!');
});
console.log("registring example routes");
export const ExampleController: Router = router;
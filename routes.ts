import express from "express";
import {ExampleController} from "./controllers/example.controller";

export * from "./controllers/example.controller";

export class TemplateApi {
    public static registerRoutes = (app: express.Application) => {
        app.use("/api", ExampleController);
    }
}

import express, { Request, Response } from "express";
import "express-async-errors";
import { json } from "body-parser";

import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { errorHandler, NotFoundError } from "@taj-inc/common";
import { currentUserRouter } from "./routes/currentUser";

const app = express();
app.use(json());

app.use(signupRouter);
app.use(signinRouter);
app.use(currentUserRouter);

app.all("*", async (req: Request, res: Response) => {
	throw new NotFoundError();
});

app.use(errorHandler);

export { app };

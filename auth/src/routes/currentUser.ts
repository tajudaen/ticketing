import express, { Request, Response } from "express";
import { currentUser, requireAuth } from "@taj-inc/common";

const router = express.Router();

router.get(
	"/api/users/current-user",
	currentUser,
	requireAuth,
	async (req: Request, res: Response) => {
		res.status(200).send({ user: req.currentUser });
	}
);

export { router as currentUserRouter };

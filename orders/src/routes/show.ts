import { NotFoundError } from "@taj-inc/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";

const router = express.Router();

router.get("/api/orders/:orderId", async (req: Request, res: Response) => {
	const order = await Order.findOne({
		_id: req.params.orderId,
		userId: req.currentUser?.id,
	}).populate("ticket");

	if (!order) throw new NotFoundError();

	res.send(order);
});

export { router as showOrderRouter };

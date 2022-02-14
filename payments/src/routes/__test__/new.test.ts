import { OrderStatus } from "@taj-inc/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns a 404 when purchasing a order thaty does not exist", async () => {
	await request(app)
		.post("/api/payments")
		.set("Authorization", `bearer ${global.signin()}`)
		.send({
			token: "sdfhjbhnkm",
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it("returns a 401 when purchasing an order thta doesn't belong to the user", async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		price: 10,
		status: OrderStatus.Created,
	});
	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Authorization", `bearer ${global.signin()}`)
		.send({
			token: "sdfhjbhnkm",
			orderId: order.id,
		})
		.expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 10,
		status: OrderStatus.Cancelled,
	});
	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Authorization", `bearer ${global.signin(userId)}`)
		.send({
			token: "sdfhjbhnkm",
			orderId: order.id,
		})
		.expect(400);
});

it("returns a 201 with valid inputs", async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price: 10,
		status: OrderStatus.Created,
	});
	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Authorization", `bearer ${global.signin(userId)}`)
		.send({
			token: "tok_visa",
			orderId: order.id,
		})
		.expect(201);

	const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
	expect(chargeOptions.source).toEqual("tok_visa");
	expect(chargeOptions.amount).toEqual(10 * 100);
	expect(chargeOptions.currency).toEqual("usd");
});

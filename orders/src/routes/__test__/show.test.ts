import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: "concert",
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	const { body: order } = await request(app)
		.post("/api/orders")
		.set("Authorization", `bearer ${user}`)
		.send({ ticketId: ticket.id })
		.expect(201);

	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set("Authorization", `bearer ${user}`)
		.send()
		.expect(200);

	expect(fetchedOrder.id).toEqual(order.id);
});

it("returns a 404 if another user tries to fetch the order of another user", async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: "concert",
		price: 20,
	});
	await ticket.save();

	const user = global.signin();

	const { body: order } = await request(app)
		.post("/api/orders")
		.set("Authorization", `bearer ${user}`)
		.send({ ticketId: ticket.id })
		.expect(201);

	await request(app)
		.get(`/api/orders/${order.id}`)
		.set("Authorization", `bearer ${global.signin()}`)
		.send()
		.expect(404);
});

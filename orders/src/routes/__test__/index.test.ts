import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const buildTicket = async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: "concert",
		price: 20,
	});
	await ticket.save();

	return ticket;
};

it("fetches order for a particular user", async () => {
	const ticketOne = await buildTicket();
	const ticketTwo = await buildTicket();
	const ticketThree = await buildTicket();

	const userOne = global.signin();
	const userTwo = global.signin();

	await request(app)
		.post("/api/orders")
		.set("Authorization", `bearer ${userOne}`)
		.send({ ticketId: ticketOne.id })
		.expect(201);

	const { body: orderOne } = await request(app)
		.post("/api/orders")
		.set("Authorization", `bearer ${userTwo}`)
		.send({ ticketId: ticketTwo.id })
		.expect(201);

	const { body: orderTwo } = await request(app)
		.post("/api/orders")
		.set("Authorization", `bearer ${userTwo}`)
		.send({ ticketId: ticketThree.id })
		.expect(201);

	const { body } = await request(app)
		.get("/api/orders")
		.set("Authorization", `bearer ${userTwo}`)
		.expect(200);

	expect(body).toHaveLength(2);
	expect(body[0].id).toEqual(orderOne.id);
	expect(body[1].id).toEqual(orderTwo.id);
});

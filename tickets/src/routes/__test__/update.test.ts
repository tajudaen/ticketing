import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns 404 if the provided id does not exist", async () => {
	const id = new mongoose.Types.ObjectId().toHexString();

	await request(app)
		.put(`/api/tickets/${id}`)
		.set("Authorization", `bearer ${global.signin()}`)
		.send({
			title: "efgh",
			price: 10,
		})
		.expect(404);
});

it("returns 401 if user is not authenticated", async () => {
	const id = new mongoose.Types.ObjectId().toHexString();

	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: "efgh",
			price: 10,
		})
		.expect(401);
});

it("returns 401 if the user does not own the ticket", async () => {
	const response = await request(app)
		.post(`/api/tickets`)
		.set("Authorization", `bearer ${global.signin()}`)
		.send({
			title: "abcd",
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Authorization", `bearer ${global.signin()}`)
		.send({
			title: "efgh",
			price: 10,
		})
		.expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
	const token = global.signin();
	const response = await request(app)
		.post(`/api/tickets`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "abcd",
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "efgh",
			price: -10,
		})
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "",
			price: 10,
		})
		.expect(400);
});

it("updates the ticket provided valid inputs", async () => {
	const token = global.signin();
	const response = await request(app)
		.post(`/api/tickets`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "abcd",
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "efgh",
			price: 10,
		})
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.title).toEqual("efgh");
	expect(ticketResponse.body.price).toEqual(10);
});

it("publishes an event", async () => {
	const token = global.signin();
	const response = await request(app)
		.post(`/api/tickets`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "abcd",
			price: 20,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "efgh",
			price: 10,
		})
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
	const token = global.signin();
	const { body } = await request(app)
		.post(`/api/tickets`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "abcd",
			price: 20,
		})
		.expect(201);

	const ticket = await Ticket.findById(body.id);
	ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
	await ticket?.save();

	await request(app)
		.put(`/api/tickets/${body.id}`)
		.set("Authorization", `bearer ${token}`)
		.send({
			title: "efgh",
			price: 10,
		})
		.expect(400);
});

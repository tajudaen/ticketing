import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
	const title = "abc";
	const price = 20;

	return request(app)
		.post("/api/tickets")
		.set("Authorization", `bearer ${global.signin()}`)
		.send({
			title,
			price,
		})
		.expect(201);
};

it("can fetch a list of tickets", async () => {
	await createTicket();
	await createTicket();
	await createTicket();

	const ticketResponse = await request(app)
		.get("/api/tickets")
		.send()
		.expect(200);

	expect(ticketResponse.body.length).toEqual(3);
});

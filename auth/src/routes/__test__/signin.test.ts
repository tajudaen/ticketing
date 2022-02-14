import request from "supertest";
import { app } from "../../app";

it("fails when email that does not exist is supplied", async () => {
	return request(app)
		.post("/api/users/signin")
		.send({
			email: "test@test.com",
			password: "password",
		})
		.expect(400);
});

it("fails when an incorrect passsword is supplied", async () => {
	await request(app)
		.post("/api/users/signup")
		.send({
			email: "test@test.com",
			password: "password",
		})
		.expect(201);

	await request(app)
		.post("/api/users/signin")
		.send({
			email: "test@test.com",
			password: "passworddfghjk",
		})
		.expect(400);
});

it("returns a token after a successful signin", async () => {
	await global.signup();

	const response = await request(app)
		.post("/api/users/signin")
		.send({
			email: "test@test.com",
			password: "password",
		})
		.expect(200);
	expect(response.body.token).toBeDefined();
});

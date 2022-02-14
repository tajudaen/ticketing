import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
	var signin: (id?: string) => string;
}

jest.mock("../nats-wrapper");

let mongo: MongoMemoryServer;
beforeAll(async () => {
	process.env.JWT_KEY = "abcde";

	const mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (const collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	if (mongo) await mongo.stop();
	await mongoose.connection.close();
});

global.signin = (id: string = new mongoose.Types.ObjectId().toHexString()) => {
	const payload = {
		id,
		email: "test@test.com",
	};

	const token = jwt.sign(payload, process.env.JWT_KEY!);

	return token;
};

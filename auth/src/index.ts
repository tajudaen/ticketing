import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
	console.log("some updates");
	if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
	if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be defined");

	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.info("connected to mongodb...");
	} catch (error) {
		console.error(error);
	}

	app.listen(3000, () => {
		console.log("running.. on port 3000!!!!!!!!");
	});
};

start();

import Queue from "bull";
import { ExpirationCompletePublisher } from "../src/events/publishers/expiration-complete-publisher";
import { natsWrapper } from "../src/nats-wrapper";

interface Payload {
	orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
	redis: {
		host: process.env.REDIS_HOST,
	},
});

expirationQueue.process(async (job) => {
	new ExpirationCompletePublisher(natsWrapper.client).publish({
		orderId: job.data.orderId,
	});
});

export { expirationQueue };
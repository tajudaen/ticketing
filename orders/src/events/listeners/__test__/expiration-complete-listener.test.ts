import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@taj-inc/common";

const setup = async () => {
	// create an instance of the listener
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: "concert",
		price: 10,
	});
	await ticket.save();
	const order = Order.build({
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiresAt: new Date(),
		ticket,
	});
	await order.save();

	const data: ExpirationCompleteEvent["data"] = {
		orderId: order.id,
	};

	// create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { data, listener, msg, order, ticket };
};

it("updates the order status to cancelled", async () => {
	const { data, listener, msg, order, ticket } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure a ticket was created!
	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelled event", async () => {
	const { data, listener, msg, order, ticket } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);

	expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
	const { data, listener, msg } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure ack function is called
	expect(msg.ack).toHaveBeenCalled();
});

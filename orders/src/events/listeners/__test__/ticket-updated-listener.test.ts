import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from "@taj-inc/common";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
	// create a listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	// create and save  a ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: "concert",
		price: 10,
	});
	await ticket.save();

	// create a fake data object
	const data: TicketUpdatedEvent["data"] = {
		version: ticket.version + 1,
		id: ticket.id,
		title: "new concert",
		price: 15,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// create a fake msg object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	// return all of this stuff
	return { data, listener, msg, ticket };
};

it("finds, updates and saves a ticket", async () => {
	const { data, listener, msg, ticket } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure a ticket was created!
	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket?.title).toEqual(data.title);
	expect(updatedTicket?.price).toEqual(data.price);
});

it("acks the message", async () => {
	const { data, listener, msg } = await setup();

	// call the onMessage function with the data object + message object
	await listener.onMessage(data, msg);

	// write assertions to make sure ack function is called
	expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
	const { data, listener, msg } = await setup();
	data.version = 10;
	try {
		await listener.onMessage(data, msg);
	} catch (error) {}

	expect(msg.ack).not.toHaveBeenCalled();
});

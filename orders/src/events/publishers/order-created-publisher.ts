import { Publisher, OrderCreatedEvent, Subjects } from "@taj-inc/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

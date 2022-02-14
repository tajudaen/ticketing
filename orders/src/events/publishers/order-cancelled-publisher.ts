import { Publisher, OrderCancelledEvent, Subjects } from "@taj-inc/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

import { Publisher, PaymentCreatedEvent, Subjects } from "@taj-inc/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

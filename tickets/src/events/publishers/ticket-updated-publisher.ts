import { Publisher, Subjects, TicketUpdatedEvent } from "@taj-inc/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

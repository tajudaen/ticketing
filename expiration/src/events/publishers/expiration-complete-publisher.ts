import { Publisher, Subjects, ExpirationCompleteEvent } from "@taj-inc/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}

import type { UUID } from "node:crypto";

import { randomUUID } from "node:crypto";

export class IdGenerator {
	public generate(): UUID {
		return randomUUID();
	}
}

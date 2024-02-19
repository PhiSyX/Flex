// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

declare interface ModeApplyFlag<F> {
	flag: F;
	args: Array<string>;
	updated_at: string;
	updated_by: string;
}

declare interface Commands {
	MODE: {
		target: string;
		modes: Record<CommandResponsesFromServer["MODE"]["added"][0][0], string | boolean>;
	};
}

declare interface CommandResponsesFromServer {
	MODE: {
		target: string;
		updated: boolean;

		added: [
			| ["b", ModeApplyFlag<AccessControlMode>]
			| ["o", ModeApplyFlag<"owner">]
			| ["a", ModeApplyFlag<"admin_operator">]
			| ["o", ModeApplyFlag<"operator">]
			| ["h", ModeApplyFlag<"half_operator">]
			| ["v", ModeApplyFlag<"vip">]
			| ["k", ModeApplyFlag<{ key: string }>]
			| ["i", ModeApplyFlag<"invite_only">]
			| ["m", ModeApplyFlag<"moderate">]
			| ["n", ModeApplyFlag<"no_external_messages">]
			| ["O", ModeApplyFlag<"oper_only">]
			| ["s", ModeApplyFlag<"secret">]
			| ["t", ModeApplyFlag<"no_topic">],
		];

		removed: CommandResponsesFromServer["MODE"]["added"];
	};
}

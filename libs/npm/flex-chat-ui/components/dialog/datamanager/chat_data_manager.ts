// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	PrivateParticipant,
} from "@phisyx/flex-chat";

// -------------- //
// Implémentation //
// -------------- //

export class DialogChatManager {
	constructor(private store: ChatStoreInterface & ChatStoreInterfaceExt) {}

	join(names: ChannelID, keys: string) {
		this.store.join_channel(names, keys);
	}

	change_nick(nickname: string) {
		this.store.change_nick(nickname);
	}

	apply_channel_settings(
		target: string,
		modes_settings: Command<"MODE">["modes"],
	) {
		this.store.apply_channel_settings(target, modes_settings);
	}

	accept_participant(participant: PrivateParticipant) {
		this.store.accept_participant(participant);
	}
	decline_participant(participant: PrivateParticipant) {
		this.store.decline_participant(participant);
	}

	update_topic(channel_name: ChannelID, topic?: string) {
		let module = this.store
			.module_manager()
			.get("TOPIC")
			.expect("Récupération du module `TOPIC`");
		module.send({ channel: channel_name, topic });
	}
}

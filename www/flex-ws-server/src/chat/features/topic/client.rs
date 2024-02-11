// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

use crate::src::chat::components::{self, client, ClientSocketInterface, Origin};

// --------- //
// Interface //
// --------- //

pub trait TopicClientSocketInterface: ClientSocketInterface
{
	/// Émet au client le sujet du salon.
	fn send_rpl_topic(&self, channel: &components::channel::Channel, updated: bool)
	{
		use crate::src::chat::features::{RplNotopicReply, RplTopicReply};

		let origin = Origin::from(self.client());
		if channel.topic_text().is_empty() {
			let rpl_notopic = RplNotopicReply {
				origin: &origin,
				channel: &channel.name,
				tags: RplNotopicReply::default_tags(),
			};
			self.emit(rpl_notopic.name(), &rpl_notopic);

			if updated {
				_ = self
					.socket()
					.to(channel.room())
					.emit(rpl_notopic.name(), rpl_notopic);
			}
		} else {
			let rpl_topic = RplTopicReply {
				origin: &origin,
				channel: channel.name.as_ref(),
				topic: channel.topic_text(),
				updated: &updated,
				updated_by: channel.topic().updated_by(),
				updated_at: channel.topic().updated_at(),
				tags: RplTopicReply::default_tags(),
			};
			self.emit(rpl_topic.name(), &rpl_topic);

			if updated {
				_ = self
					.socket()
					.to(channel.room())
					.emit(rpl_topic.name(), rpl_topic);
			}
		};
	}
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

impl<'s> TopicClientSocketInterface for client::Socket<'s> {}

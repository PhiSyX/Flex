<script lang="ts" setup>
import type { ChannelActivitiesView } from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

import { ChannelMember, ChannelRoom, RoomMessage } from "@phisyx/flex-chat";
import { format_date } from "@phisyx/flex-date";
import { None, Some } from "@phisyx/flex-safety";

import ChannelActivities from "./ChannelActivities.template.vue";

let channel = new ChannelRoom("#iBug" as ChannelID);

let user = new ChannelMember({
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "PhiSyX",
});

channel.add_member(user);

let member = channel.get_member_by_nickname("PhiSyX");

let msgid = "0000-0000-0000-0000-0000" as UUID;
channel.add_message(
	new RoomMessage<"channel", { text: string }>("hello world")
		.with_type("privmsg")
		.with_id(msgid),
);
let message = channel.get_message<{ text: string }>(msgid);

let activities: ChannelActivitiesView = {
	groups: [
		{
			activities: [
				{
					channel,
					member: member,
					message: message,
					previousMessages: [],
				},
			],
			createdAt: format_date("D/m/y H:i:s", new Date()),
			updatedAt: None(),
			name: "notice",
		},
	],
};

let current_client_member: Option<ChannelMember> = Some(user);
</script>

<template>
	<Story title="Molecules/ChannelActivities" responsive-disabled>
		<Variant title="Default">
			<ChannelActivities
				:activities="activities"
				:current-client-member="current_client_member"
				:room="channel"
				:expanded="false"
			/>
		</Variant>

		<Variant title="Expanded">
			<ChannelActivities
				:activities="activities"
				:current-client-member="current_client_member"
				:room="channel"
				:expanded="true"
			/>
		</Variant>
	</Story>
</template>

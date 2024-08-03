<script lang="ts" setup>
import {
	type ChannelActivitiesView,
	ChannelMember,
	ChannelRoom,
	RoomMessage,
} from "@phisyx/flex-chat";
import { formatDate } from "@phisyx/flex-date";
import { None, type Option, Some } from "@phisyx/flex-safety";

import ChannelActivities from "./ChannelActivities.vue";

const channel = new ChannelRoom("#iBug" as ChannelID);

const user = new ChannelMember({
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "PhiSyX",
});

channel.addMember(user);

const member = channel.getMemberByNickname("PhiSyX");

const msgid = "0000-0000-0000-0000-0000";
channel.addMessage(
	new RoomMessage<"channel", { text: string }>()
		.withType("privmsg")
		.withMessage("hello world")
		.withID(msgid),
);
const message = channel.getMessageFrom<{ text: string }>(msgid).unwrap();

const activities: ChannelActivitiesView = {
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
			createdAt: formatDate("D/m/y H:i:s", new Date()),
			updatedAt: None(),
			name: "notice",
		},
	],
};

const currentClientMember: Option<ChannelMember> = Some(user);
</script>

<template>
	<Story title="Molecules/ChannelActivities" responsive-disabled>
		<Variant title="Default">
			<ChannelActivities
				:activities="activities"
				:current-client-member="currentClientMember"
				:room="channel"
				:expanded="false"
			/>
		</Variant>

		<Variant title="Expanded">
			<ChannelActivities
				:activities="activities"
				:current-client-member="currentClientMember"
				:room="channel"
				:expanded="true"
			/>
		</Variant>
	</Story>
</template>

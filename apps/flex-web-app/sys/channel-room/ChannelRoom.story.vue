<script setup lang="ts">
import { None, Some } from "@phisyx/flex-safety";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelTopic } from "~/channel/ChannelTopic";
import { ChannelMembers } from "~/channel/ChannelMembers";
import { RoomMessage } from "~/room/RoomMessage";

import ChannelRoomKicked from "#/sys/channel-room-kicked/ChannelRoomKicked.vue";
import ChannelRoom from "./ChannelRoom.vue";
import { User } from "~/user/User";

const channelName = "#channel";

const topic = new ChannelTopic();
topic.set("Mon super topic");

// @ts-expect-error : ?
const messages = [];

const origin1: User = new User({
	access_level: ["Owner"],
	id: "a-b-c-d-e" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
} as ChannelOrigin);

const origin2: User = new User({
	id: "f-g-h-i-j" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});

const me = Some(new ChannelMember(origin1));

messages.push(
	new RoomMessage()
		.withData({ origin: origin1 })
		.withID("id")
		.withIsMe(false)
		.withMessage("Hello World")
		.withNickname("ModeratorUser")
		.withTarget(channelName)
		.withTime(new Date())
		.withType("pubmsg"),
	new RoomMessage()
		.withData({
			origin: origin1,
			channel: "#channel",
			knick: origin2,
			name: "KICK",
			reason: "Dehors !",
			tags: { msgid: "id" },
		} as GenericReply<"KICK">)
		.withID("id2")
		.withIsMe(false)
		.withMessage("Hello World")
		.withNickname("ModeratorUser")
		.withTarget(channelName)
		.withTime(new Date())
		.withType("event:kick")
);

const users = new ChannelMembers();

const origin3: User = new User({
	id: "k-l-m-n-o" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

users.add(new ChannelMember(origin1).withAccessLevel(ChannelAccessLevel.Owner));
users.add(new ChannelMember(origin2).withAccessLevel(ChannelAccessLevel.Vip));
users.add(new ChannelMember(origin3).withAccessLevel(ChannelAccessLevel.User));
</script>

<template>
	<Story title="Organisms/ChannelRoom" responsive-disabled>
		<Variant title="Default">
			<ChannelRoom
				:can-edit-topic="false"
				:current-nick="origin3.nickname"
				:disable-input="false"
				:me="me"
				:messages="messages"
				:name="channelName"
				:users="users"
				:selected-user="None()"
				:topic="topic"
			/>
		</Variant>

		<Variant title="Kicked">
			<ChannelRoom
				:can-edit-topic="false"
				:current-nick="origin3.nickname"
				:disable-input="false"
				:me="me"
				:messages="messages"
				:name="channelName"
				:users="users"
				:selected-user="None()"
				:topic="topic"
			>
				<template #history>
					<ChannelRoomKicked :last-message="messages.at(-1)" />
				</template>
			</ChannelRoom>
		</Variant>
	</Story>
</template>

<style>
#app [data-v-app],
.histoire-generic-render-story {
	height: 100%;
	color: var(--default-text-color);
}

.room\/channel {
	height: 100%;
}
</style>

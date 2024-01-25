<script setup lang="ts">
import { None, Some } from "@phisyx/flex-safety";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelTopic } from "~/channel/ChannelTopic";
import { ChannelUsers } from "~/channel/ChannelUsers";
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
	id: "uuid0",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
} as ChannelOrigin);

const origin2: User = new User({
	id: "uuid1",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});

const me = Some(new ChannelNick(origin1));

messages.push(
	new RoomMessage()
		.withData({ origin: origin1 })
		.withID("id")
		.withIsMe(false)
		.withMessage("Hello World")
		.withNickname("ModeratorUser")
		.withTarget(channelName)
		.withTime(new Date())
		.withType("privmsg"),
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

const users = new ChannelUsers();

const origin3: User = new User({
	id: "uuid3",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

users.add(new ChannelNick(origin1).withAccessLevel(ChannelAccessLevel.Owner));
users.add(new ChannelNick(origin2).withAccessLevel(ChannelAccessLevel.Vip));
users.add(new ChannelNick(origin3).withAccessLevel(ChannelAccessLevel.User));
</script>

<template>
	<Story title="Molecules/ChannelRoom" responsive-disabled>
		<Variant title="Default">
			<ChannelRoom
				:can-edit-topic="false"
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

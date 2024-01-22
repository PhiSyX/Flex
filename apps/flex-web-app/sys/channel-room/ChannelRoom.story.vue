<script setup lang="ts">
import { None } from "@phisyx/flex-safety";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelTopic } from "~/channel/ChannelTopic";
import { ChannelUsers } from "~/channel/ChannelUsers";
import { RoomMessage } from "~/room/RoomMessage";

import ChannelRoom from "./ChannelRoom.vue";

const channelName = "#channel";

const topic = new ChannelTopic();
topic.set("Mon super topic");

const messages = [];

const origin1: ChannelOrigin = {
	access_level: ["Owner"],
	id: "uuid0",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
};

const me = new ChannelNick(origin1);

messages.push(
	new RoomMessage()
		.withData({ origin: origin1 })
		.withID("id")
		.withIsMe(false)
		.withMessage("Hello World")
		.withNickname("ModeratorUser")
		.withTarget(channelName)
		.withTime(new Date())
		.withType("privmsg")
);

const users = new ChannelUsers();

const origin2: Origin = {
	id: "uuid1",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
};
const origin3: Origin = {
	id: "uuid3",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
};

users.add(new ChannelNick(origin1).withAccessLevel(ChannelAccessLevel.Owner));
users.add(new ChannelNick(origin2).withAccessLevel(ChannelAccessLevel.Vip));
users.add(new ChannelNick(origin3).withAccessLevel(ChannelAccessLevel.User));
</script>

<template>
	<Story title="Molecules/ChannelRoom" responsive-disabled>
		<Variant title="Default">
			<ChannelRoom
				:me="me"
				:messages="messages"
				:name="channelName"
				:users="users"
				:selected-user="None()"
				:topic="topic"
			/>
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

<script setup lang="ts">
import { ChannelUsers } from "~/channel/ChannelUsers";
import ChannelRoom from "./ChannelRoom.vue";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { RoomMessage } from "~/room/RoomMessage";

const channelName = "#channel";

const messages = [];

const origin1: Origin = {
	access_level: ["Owner"],
	id: "uuid0",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
};

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
				:messages="messages"
				:name="channelName"
				:users="users"
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

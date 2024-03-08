<script setup lang="ts">
import { None, Some } from "@phisyx/flex-safety";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelRoom } from "~/channel/ChannelRoom";
import { RoomMessage } from "~/room/RoomMessage";
import { User } from "~/user/User";

import ChannelRoomKicked from "#/sys/channel-room-kicked/ChannelRoomKicked.vue";
import ChannelRoomComponent from "./ChannelRoom.vue";

const channelName = "#channel" as ChannelID;

const channel = new ChannelRoom(channelName);
channel.topic.set("Mon super topic");

const origin1: User = new User({
	access_level: ["Owner"],
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
} as ChannelOrigin);

const origin2: User = new User({
	id: "f-g-h-i-j" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});

const me = Some(new ChannelMember(origin1));

channel.messages.push(
	new RoomMessage()
		.withData({ origin: origin1 })
		.withID("id")
		.withIsCurrentClient(false)
		.withMessage("Hello World")
		.withNickname("ModeratorUser")
		.withTarget(channelName)
		.withTime(new Date())
		.withType("pubmsg"),
	new RoomMessage()
		.withData({
			origin: origin1,
			channel: "#channel" as ChannelID,
			knick: origin2,
			name: "KICK",
			reason: "Dehors !",
			tags: { msgid: "id" },
		} as GenericReply<"KICK">)
		.withID("id2")
		.withIsCurrentClient(false)
		.withMessage("Hello World")
		.withNickname("ModeratorUser")
		.withTarget(channelName)
		.withTime(new Date())
		.withType("event:kick"),
);

const origin3: User = new User({
	id: "k-l-m-n-o" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

channel.members.add(new ChannelMember(origin1).withAccessLevel(ChannelAccessLevel.Owner));
channel.members.add(new ChannelMember(origin2).withAccessLevel(ChannelAccessLevel.Vip));
channel.members.add(new ChannelMember(origin3).withAccessLevel(ChannelAccessLevel.User));
</script>

<template>
	<Story title="Organisms/ChannelRoom" responsive-disabled>
		<Variant title="Default">
			<ChannelRoomComponent
				:completion-list="[]"
				:current-nickname="origin3.nickname"
				:current-client-member="me"
				:selected-member="None()"
				:room="channel"
			/>
		</Variant>

		<Variant title="Kicked">
			<ChannelRoomComponent
				:current-nickname="origin3.nickname"
				:current-client-member="me"
				:name="channelName"
				:selected-member="None()"
				:room="channel"
			>
				<template #history>
					<ChannelRoomKicked
						:last-message="channel.messages.at(-1)!"
					/>
				</template>
			</ChannelRoomComponent>
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

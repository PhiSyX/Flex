<script setup lang="ts">
import { None, Some } from "@phisyx/flex-safety";

import { channelID } from "~/asserts/room";
import { ChannelAccessLevelFlag } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelRoom } from "~/channel/ChannelRoom";
import { RoomMessage } from "~/room/RoomMessage";
import { User } from "~/user/User";

import ChannelRoomKicked from "#/sys/channel-room-kicked/ChannelRoomKicked.vue";
import ChannelRoomComponent from "./ChannelRoom.vue";

const channelName = channelID("#channel");

const chan = new ChannelRoom(channelName);
chan.topic.set("Mon super topic");

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

chan.messages.push(
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
			channel: channelID("#channel"),
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

chan.members.add(
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevelFlag.Owner),
);
chan.members.add(
	new ChannelMember(origin2).withAccessLevel(ChannelAccessLevelFlag.Vip),
);
chan.members.add(
	new ChannelMember(origin3).withAccessLevel(ChannelAccessLevelFlag.User),
);
</script>

<template>
	<Story title="Organisms/ChannelRoom" responsive-disabled>
		<Variant title="Default">
			<ChannelRoomComponent
				:completion-list="[]"
				:current-nickname="origin3.nickname"
				:current-client-member="me"
				:selected-member="None()"
				:room="chan"
			/>
		</Variant>

		<Variant title="Kicked">
			<ChannelRoomComponent
				:current-nickname="origin3.nickname"
				:current-client-member="me"
				:name="channelName"
				:selected-member="None()"
				:room="chan"
			>
				<template #history>
					<ChannelRoomKicked
						:last-message="chan.messages.at(-1)!"
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

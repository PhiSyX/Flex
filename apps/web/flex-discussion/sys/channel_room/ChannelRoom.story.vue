<script setup lang="ts">
import { None, Some } from "@phisyx/flex-safety";

import {
	ChannelAccessLevelFlag,
	ChannelMember,
	ChannelRoom,
	RoomMessage,
	User,
	cast_to_channel_id,
} from "@phisyx/flex-chat";

import ChannelRoomKicked from "#/sys/channel_room/ChannelRoomKicked.vue";
import ChannelRoomComponent from "./ChannelRoom.template.vue";

let channel_name = cast_to_channel_id("#channel");

let chan = new ChannelRoom(channel_name);
chan.topic.set("Mon super topic");

let origin1: User = new User({
	access_level: ["Owner"],
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
} as ChannelOrigin);

let origin2: User = new User({
	id: "f-g-h-i-j" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});

let me = Some(new ChannelMember(origin1));

chan.messages.push(
	new RoomMessage("Hello World")
		.with_data({ origin: origin1 })
		.with_id("id")
		.with_is_current_client(false)
		.with_nickname("ModeratorUser")
		.with_target(channel_name)
		.with_type("pubmsg"),
	new RoomMessage("Hello World")
		.with_data({
			origin: origin1,
			channel: cast_to_channel_id("#channel"),
			knick: origin2,
			name: "KICK",
			reason: "Dehors !",
			tags: { msgid: "id" },
		} as GenericReply<"KICK">)
		.with_id("id2")
		.with_is_current_client(false)
		.with_nickname("ModeratorUser")
		.with_target(channel_name)
		.with_type("event:kick"),
);

let origin3: User = new User({
	id: "k-l-m-n-o" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

chan.members.add(
	new ChannelMember(origin1).with_access_level(ChannelAccessLevelFlag.Owner),
);
chan.members.add(
	new ChannelMember(origin2).with_access_level(ChannelAccessLevelFlag.Vip),
);
chan.members.add(
	new ChannelMember(origin3).with_access_level(ChannelAccessLevelFlag.User),
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
				:userlist-displayed-by-default="true"
			/>
		</Variant>

		<Variant title="Kicked">
			<ChannelRoomComponent
				:current-nickname="origin3.nickname"
				:current-client-member="me"
				:name="channel_name"
				:selected-member="None()"
				:room="chan"
				:userlist-displayed-by-default="true"
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

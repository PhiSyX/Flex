<script lang="ts" setup>
import { channelID } from "~/asserts/room";
import { ChannelListCustomRoom } from "~/custom_room/channel_list";

import ChannelList from "./ChannelList.vue";

const emptyRoom = new ChannelListCustomRoom();

const room = new ChannelListCustomRoom();
room.insert({
	channel: channelID("#chan"),
	modes_settings: "nt",
	topic: "Mon super topic",
	total_members: 42,
});
</script>

<template>
	<Story title="Organisms/ChannelList" responsive-disabled>
		<Variant title="Default">
			<ChannelList :room="room" />
		</Variant>

		<Variant title="Empty">
			<ChannelList :room="emptyRoom" />
		</Variant>
	</Story>
</template>

<script lang="ts" setup>
import { ChannelListCustomRoom } from "~/custom-room/ChannelListCustomRoom";
import ChannelList from "./ChannelList.vue";

const emptyRoom = new ChannelListCustomRoom();

const room = new ChannelListCustomRoom();
room.insert({
	channel: "#chan" as ChannelID,
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

<script lang="ts" setup>
import { ChannelListCustomRoom, channelID } from "@phisyx/flex-chat";

import ChannelList from "./ChannelList.template.vue";

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

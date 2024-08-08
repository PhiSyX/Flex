<script lang="ts" setup>
import { ChannelListCustomRoom, cast_to_channel_id } from "@phisyx/flex-chat";

import ChannelList from "./CustomRoomChannelList.template.vue";

let empty_room = new ChannelListCustomRoom();

let room = new ChannelListCustomRoom();
room.insert({
	channel: cast_to_channel_id("#chan"),
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
			<ChannelList :room="empty_room" />
		</Variant>
	</Story>
</template>

<script lang="ts" setup>
import { cast_to_channel_id } from "@phisyx/flex-chat";

import ChannelList from "./CustomRoomChannelList.template.vue";

let channels = [
	{
		channel: cast_to_channel_id("#chan"),
		modes_settings: "nt",
		topic: "Mon super topic",
		total_members: 42,
	}
];
</script>

<template>
	<Story title="Organisms/ChannelList" responsive-disabled>
		<Variant title="Default">
			<ChannelList :channels="channels" />
		</Variant>

		<Variant title="Empty">
			<ChannelList :channels="[]" />
		</Variant>
	</Story>
</template>

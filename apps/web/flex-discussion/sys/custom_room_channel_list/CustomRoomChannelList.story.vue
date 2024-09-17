<script lang="ts" setup>
import { cast_to_channel_id } from "@phisyx/flex-chat/asserts/room";

import ChannelList from "./CustomRoomChannelList.template.vue";

let channels = [
	{
		channel: cast_to_channel_id("#chan"),
		modes_settings: "nt",
		topic: "Mon super topic",
		total_members: 42,
		code: 300,
		message: "",
		name: "RPL_LIST",
		origin: {
			id: "" as UserID,
			ident: "ident",
			nickname: "nickname",
			host: { cloaked: "cloaked" },
		},
		tags: { msgid: "uuid" as UUID },
	},
] satisfies Array<GenericReply<"RPL_LIST">>;
</script>

<template>
	<Story title="Organisms/ChannelList" responsive-disabled>
		<Variant title="Default">
			<ChannelList servername="@flex" :channels="channels" />
		</Variant>

		<Variant title="Empty">
			<ChannelList servername="@flex"  :channels="[]" />
		</Variant>
	</Story>
</template>

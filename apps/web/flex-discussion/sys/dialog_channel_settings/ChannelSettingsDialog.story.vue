<script lang="ts" setup>
import { cast_to_channel_id } from "@phisyx/flex-chat/asserts/room";
import { ChannelMember } from "@phisyx/flex-chat/channel/member";
import { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import { User, UserFlag } from "@phisyx/flex-chat/user";

import ChannelSettingsDialog from "./ChannelSettingsDialog.template.vue";

let channel1 = new ChannelRoom(cast_to_channel_id("#chan1"));
channel1.set_setting_mode("s");
channel1.set_setting_mode("m");
let current_client_channel_member = new ChannelMember(
	new User({
		host: { cloaked: "*" },
		id: "uuid" as UserID,
		ident: "ident",
		nickname: "nickname",
	}),
);

let channel2 = new ChannelRoom(cast_to_channel_id("#chan2"));
channel2.set_setting_mode("n");
channel2.set_setting_mode("t");
let current_client_channel_member2 = new ChannelMember(
	new User({
		host: { cloaked: "*" },
		id: "uuid" as UserID,
		ident: "ident",
		nickname: "nickname",
	}),
).with_operator_flag(UserFlag.GlobalOperator);
</script>

<template>
	<Story title="Molecules/Dialog/ChannelSettingsDialog" responsive-disabled>
		<Variant title="Désactivé">
			<ChannelSettingsDialog
				layer-name="layer"
				:room="channel1"
				:current-client-channel-member="current_client_channel_member"
			/>
		</Variant>

		<Variant title="État d'opérateur de salon ou d'opérateur global">
			<ChannelSettingsDialog
				layer-name="layer"
				:room="channel2"
				:current-client-channel-member="current_client_channel_member2"
			/>
		</Variant>
	</Story>
</template>

<style>
#app [data-v-app] {
	width: 100vw;
	height: 100vh;
}
#app [data-v-app] > div {
	width: 100%;
	height: 100%;
	display: flex;
	place-items: center;
}
#app [data-v-app] > div > dialog {
	position: relative;
	margin: auto;
}
</style>

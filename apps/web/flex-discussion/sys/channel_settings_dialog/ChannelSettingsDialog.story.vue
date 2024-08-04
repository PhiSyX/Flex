<script lang="ts" setup>
import { ChannelMember, ChannelRoom, User, cast_to_channel_id } from "@phisyx/flex-chat";

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
				:current-client-channel-member="current_client_channel_member"
			/>
		</Variant>
	</Story>
</template>

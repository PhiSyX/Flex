<script lang="ts" setup>
import { ChannelMember, ChannelRoom, User, channelID } from "@phisyx/flex-chat";

import ChannelSettingsDialog from "./ChannelSettingsDialog.template.vue";

const channel1 = new ChannelRoom(channelID("#chan1"));
channel1.setSettingMode("s");
channel1.setSettingMode("m");
const currentClientChannelMember = new ChannelMember(
	new User({
		host: { cloaked: "*" },
		id: "uuid" as UserID,
		ident: "ident",
		nickname: "nickname",
	}),
);

const channel2 = new ChannelRoom(channelID("#chan2"));
channel2.setSettingMode("n");
channel2.setSettingMode("t");
</script>

<template>
	<Story title="Molecules/Dialog/ChannelSettingsDialog" responsive-disabled>
		<Variant title="Désactivé">
			<ChannelSettingsDialog
				layer-name="layer"
				:room="channel1"
				:current-client-channel-member="currentClientChannelMember"
			/>
		</Variant>

		<Variant title="État d'opérateur de salon ou d'opérateur global">
			<ChannelSettingsDialog
				layer-name="layer"
				:room="channel2"
				:current-client-channel-member="currentClientChannelMember"
			/>
		</Variant>
	</Story>
</template>

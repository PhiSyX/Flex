<script lang="ts" setup>
import { ChannelRoom } from "~/channel/ChannelRoom";
import ChannelSettingsDialog from "./ChannelSettingsDialog.vue";
import { ChannelMember } from "~/channel/ChannelMember";
import { User } from "~/user/User";

const channel1 = new ChannelRoom("#chan1");
channel1.setSettingMode("s");
channel1.setSettingMode("m");
const currentClientChannelMember = new ChannelMember(
	new User({
		host: { cloaked: "*" },
		id: "uuid" as UUID,
		ident: "ident",
		nickname: "nickname",
	})
);

const channel2 = new ChannelRoom("#chan2");
channel2.setSettingMode("n");
channel2.setSettingMode("t");
</script>

<template>
	<Story title="Molecules/ChannelSettingsDialog" responsive-disabled>
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

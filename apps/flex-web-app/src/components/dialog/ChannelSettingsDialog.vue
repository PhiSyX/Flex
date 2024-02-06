<script setup lang="ts">
import { Option } from "@phisyx/flex-safety";

import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelRoom } from "~/channel/ChannelRoom";
import { useChatStore } from "~/store/ChatStore";

import { getLayer, hasLayer } from "./Dialog.state";
import { closeLayer } from "./Dialog.handlers";

import ChannelSettingsDialog from "#/sys/channel-settings-dialog/ChannelSettingsDialog.vue";
import Match from "#/sys/match/Match.vue";

const LAYER_NAME: string = "channel-settings-layer";
const channelSettingsLayer = getLayer<{
	room: ChannelRoom;
	cnick: Option<ChannelNick>;
}>(LAYER_NAME);
const hasChannelSettingsLayer = hasLayer(LAYER_NAME);
const closeChannelSettingsLayerHandler = closeLayer(LAYER_NAME);

const chatStore = useChatStore();

function submitHandler(modesSettings: Command<"MODE">["modes"]) {
	chatStore.applyChannelSettings(
		channelSettingsLayer.value.data!.room.name,
		modesSettings
	);
	closeChannelSettingsLayerHandler();
}

function updateTopicHandler(topic?: string) {
	if (channelSettingsLayer.value.data!.room.topic.get() === topic) {
		return;
	}

	chatStore.updateTopic(channelSettingsLayer.value.data!.room.name, topic);
}
</script>

<template>
	<Teleport
		v-if="hasChannelSettingsLayer && channelSettingsLayer.data"
		:to="`#${LAYER_NAME}_teleport`"
	>
		<Match :maybe="channelSettingsLayer.data.cnick">
			<template #some="{ data: cnick }">
				<ChannelSettingsDialog
					:layer-name="LAYER_NAME"
					:can-edit-topic="
						channelSettingsLayer.data.room.canEditTopic(cnick)
					"
					:channel="channelSettingsLayer.data.room.name"
					:settings="
						Array.from(channelSettingsLayer.data.room.settings)
					"
					:is-global-operator="cnick.intoUser().isOperator()"
					:is-channel-operator="
						channelSettingsLayer.data.room.cnickHasChannelOperatorAccessLevel(
							cnick
						)
					"
					:topics="channelSettingsLayer.data.room.topic.history"
					@close="closeChannelSettingsLayerHandler"
					@submit="submitHandler"
					@update-topic="updateTopicHandler"
				/>
			</template>
		</Match>
	</Teleport>
</template>

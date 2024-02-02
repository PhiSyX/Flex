<script setup lang="ts">
import { useChatStore } from "~/store/ChatStore";

import { closeLayer } from "./Dialog.handlers";
import { hasLayer } from "./Dialog.state";

import ChangeNickDialog from "#/sys/change-nick-dialog/ChangeNickDialog.vue";

const chatStore = useChatStore();

const LAYER_NAME: string = "change-nick-request";
const hasRequestChangeNickLayer = hasLayer(LAYER_NAME);
const closeRequestChangeNickHandler = closeLayer(LAYER_NAME);

function changeNickHandler(nickname: string) {
	chatStore.changeNick(nickname);
	closeRequestChangeNickHandler();
}
</script>

<template>
	<Teleport
		v-if="hasRequestChangeNickLayer"
		:to="`#${LAYER_NAME}_teleport`"
	>
		<ChangeNickDialog
			:layer-name="LAYER_NAME"
			@close="closeRequestChangeNickHandler"
			@submit="changeNickHandler"
		/>
	</Teleport>
</template>

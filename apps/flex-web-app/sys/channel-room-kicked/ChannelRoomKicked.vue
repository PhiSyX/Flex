<script setup lang="ts">
import { type Emits, joinChannel } from "./ChannelRoomKicked.handlers";

import {
	type Props,
	computeReason,
	computeChannel,
	computeNickname,
	displayJoinButton,
	toRawLastMessage,
} from "./ChannelRoomKicked.state";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const lastMessage = toRawLastMessage(props);

const nickname = computeNickname(props);
const channel = computeChannel(props);
const reason = computeReason(props);

const joinChannelHandler = joinChannel(emit, { lastMessage });
</script>

<template>
	<div class="channel/kicked [ flex:full flex! flex/center:full px=3 ]">
		<p>
			Vous avez été sanctionné par
			<strong>{{ nickname }}</strong>
			du salon {{ channel }} pour la raison suivante «
			<strong>{{ reason }}</strong> » !
		</p>

		<button
			v-if="displayJoinButton"
			class="[ p=1 cursor:pointer ]"
			@click="joinChannelHandler()"
		>
			Rejoindre le salon
		</button>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("channel/kicked") {
	background: var(--room-kicked-bg);
}

p {
	color: var(--color-red400);
	font-variant: small-caps;
}

button {
	border-radius: 4px;

	background: var(--room-kicked-button-bg);
	color: var(--room-kicked-button-color);
}
</style>

<script setup lang="ts">
import { RoomMessage } from "~/room/RoomMessage";

import { Emits, sendMessage } from "./ServerCustomRoom";

import Room from "#/sys/room/Room.vue";

// ---- //
// Type //
// ---- //

interface Props {
	forumUrl: string;
	messages: Array<RoomMessage>;
	name: string;
	vademecumUrl: string;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const sendMessageHandler = sendMessage(emit, props.name);
</script>

<template>
	<div class="room/custom:server [ flex! ov:h ]">
		<Room
			:messages="messages"
			:name="name"
			@send-message="sendMessageHandler"
		>
			<template #topic>
				<p class="[ flex flex/center:full h:full m=0 p=0 select:none ]">
					Bienvenue sur le Chat de {{ name }} !
				</p>
			</template>

			<template #after-topic-before-main>
				<header class="[ flex align-jc:center gap=3 my=1 ]">
					<a :href="vademecumUrl">
						<strong>VADEMECUM</strong>
						Lire / Relire les instructions officielles
					</a>

					<a :href="forumUrl">
						<strong>Forum</strong>
						Consulter le forum des opérateurs
					</a>
				</header>
			</template>
		</Room>
	</div>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/custom:server") {
	background: var(--room-bg);

	header a {
		display: inline-flex;
		flex-direction: column;
		text-align: center;
		gap: fx.space(1);
		padding: fx.space(2);

		font-size: 14px;
		color: var(--color-white);
		text-decoration: none;
		border-radius: 4px;

		strong {
			font-weight: 800;
			text-transform: uppercase;
		}

		background-color: var(--color-cyan800);
	}

	@include fx.class("room/topic") {
		background: var(--room-bg);
	}

	@include fx.class("room/logs") {
		background: var(--room-bg);
	}

	@include fx.class("room/editbox") {
		background-color: var(--body-bg);

		input {
			margin-left: 1px;
		}
	}
}
</style>

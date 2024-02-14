<script setup lang="ts">
import { ServerCustomRoom } from "~/custom-room/ServerCustomRoom";

import Room from "#/sys/room/Room.vue";

// ---- //
// Type //
// ---- //

interface Props {
	forumUrl: string;
	vademecumUrl: string;
	currentNickname: string;
	room: ServerCustomRoom;
}

interface Emits {
	(evtName: "change-nickname", event: MouseEvent): void;
	(evtName: "open-room", roomName: string): void;
	(evtName: "send-message", message: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const changeNickRequest = (event: MouseEvent) => emit("change-nickname", event);
const openRoom = (roomName: string) => emit("open-room", roomName);
const sendMessage = (message: string) => emit("send-message", message);
</script>

<template>
	<div class="room/custom:server [ flex! ov:h ]">
		<Room
			:current-client-nickname="currentNickname"
			:room="room"
			@change-nickname="changeNickRequest"
			@open-room="openRoom"
			@send-message="sendMessage"
		>
			<template #topic>
				<p class="[ flex flex/center:full h:full m=0 p=0 select:none ]">
					Bienvenue sur le Chat de {{ room.name }} !
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

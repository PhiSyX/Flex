<script setup lang="ts">
import type { ServerCustomRoom } from "@phisyx/flex-chat";

import Room from "#/sys/room/Room.template.vue";

// ---- //
// Type //
// ---- //

interface Props 
{
	forumUrl: string;
	vademecumUrl: string;
	currentNickname: string;
	room: ServerCustomRoom;
}

interface Emits 
{
	(event_name: "change-nickname", event: MouseEvent): void;
	(event_name: "open-room", room_id: RoomID): void;
	(event_name: "send-message", message: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

// -------- //
// Fonction //
// -------- //

const change_nickname_request_handler = (event: MouseEvent) => emit("change-nickname", event);
const open_room_handler = (room_id: RoomID) => emit("open-room", room_id);
const send_message_handler = (message: string) => emit("send-message", message);
</script>

<template>
	<div class="room/custom:server [ flex! ov:h ]">
		<Room
			:current-client-nickname="currentNickname"
			:room="room"
			@change-nickname="change_nickname_request_handler"
			@open-room="open_room_handler"
			@send-message="send_message_handler"
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

		background-color: var(--color-cyan800);

		strong {
			font-weight: 800;
			text-transform: uppercase;
		}
	}

	@include fx.class("room/topic") {
		background: var(--room-bg);
	}

	@include fx.class("room/main") {
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

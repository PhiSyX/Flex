<script setup lang="ts">
import type { NoticeCustomRoom } from "@phisyx/flex-chat";

import { ButtonIcon } from "@phisyx/flex-vue-uikit";

import Room from "#/sys/room/Room.template.vue";

// ---- //
// Type //
// ---- //

interface Props 
{
	room: NoticeCustomRoom;
}

interface Emits 
{
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(event_name: "close"): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
	<div class="room/custom:notice [ flex! ov:h ]">
		<Room :display-input="false" :room="room">
			<template #topic>
				<p class="[ flex flex/center:full h:full m=0 p=0 select:none ]">
					Liste des notices reçues
				</p>
			</template>

			<template #topic-action>
				<ButtonIcon
					icon="close"
					title="Fermer la chambre active"
					@click="emit('close')"
				/>
			</template>
		</Room>
	</div>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/custom:notice") {
	background: var(--room-bg);

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

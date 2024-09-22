<script setup lang="ts">
import type { MentionsCustomRoom } from "@phisyx/flex-chat/custom_room/mentions";

import ActionBar from "@phisyx/flex-uikit-vue/actionbar/ActionBar.vue";
import { UiButton } from "@phisyx/flex-vue-uikit";

import Room from "#/sys/room/Room.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	room: MentionsCustomRoom;
}

interface Emits {
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
	<div class="room/custom:mentions [ flex! ov:h ]">
		<Room :display-input="false" :room="room">
			<template #before-main>
				<ActionBar>
					<p
						class="[ flex flex/center:full h:full m=0 p=0 select:none ]"
					>
						Liste des mentions reçues
					</p>

					<template #actions>
						<UiButton
							icon="close"
							title="Fermer la chambre active"
							@click="emit('close')"
						/>
					</template>
				</ActionBar>
			</template>
		</Room>
	</div>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/custom:mentions") {
	background: var(--room-bg);

	@include fx.class("room/topic") {
		background: var(--room-bg);
	}

	@include fx.class("room/logs") {
		background: var(--room-bg);
	}

	@include fx.class("room/echo") {
		&::before {
			content: "[" attr(data-target) "] ";
			color: var(--room-message-mention-target-color);
		}
	}

	@include fx.class("room/editbox") {
		background-color: var(--body-bg);

		input {
			margin-left: 1px;
		}
	}
}
</style>

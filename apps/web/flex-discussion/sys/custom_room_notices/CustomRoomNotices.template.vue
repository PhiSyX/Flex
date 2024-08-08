<script setup lang="ts">
import type { NoticesCustomRoom } from "@phisyx/flex-chat";

import { shallowRef as shallow_ref, watch } from "vue";

import { ButtonIcon } from "@phisyx/flex-vue-uikit";

import notice_audio from "#/assets/audio/notice.mp3";
import Room from "#/sys/room/Room.template.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	room: NoticesCustomRoom;
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

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let $audio = shallow_ref<HTMLAudioElement>();

watch(props.room.messages, () => {
	if ($audio.value) {
		$audio.value.play();
		$audio.value.currentTime = 0;
	}
});
</script>

<template>
	<div class="room/custom:notices [ flex! ov:h ]">
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

		<audio ref="$audio" :src="notice_audio" :autoplay="true" />
	</div>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/custom:notices") {
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

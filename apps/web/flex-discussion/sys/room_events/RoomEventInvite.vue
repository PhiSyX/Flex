<script setup lang="ts">
import type { Props } from "./RoomEvent.state";

// ---- //
// Type //
// ---- //

interface Emits {
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(event_name: "open-room", room_name: string): void;
}

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const { data } = defineProps<Props<"INVITE">>();
const emit = defineEmits<Emits>();

// ------- //
// Handler //
// ------- //

const open_channel_handler = () => emit("open-room", data.channel);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p v-if="is_current_client">
		* <strong>Tu</strong> as invité <bdo>{{ data.nick }}</bdo> à rejoindre
		le salon <span>{{ data.channel }}</span>
	</p>
	<p v-else>
		<bdo>{{ data.nick }}</bdo> a été invité à rejoindre le salon
		<span @dblclick="open_channel_handler">{{ data.channel }}</span>
	</p>
</template>

<style scoped lang="scss">
@use "@phisyx/flexsheets" as fx;

p {
	color: var(--room-event-nick-color);
}

bdo,
span {
	color: var(--default-text-color);
}

span {
	cursor: pointer;
}
</style>

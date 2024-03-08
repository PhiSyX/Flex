<script setup lang="ts">
import type { Props } from "./RoomEvent.state";

// ---- //
// Type //
// ---- //

interface Emits {
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(evtName: "open-room", roomName: string): void;
}

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"INVITE">>();
const emit = defineEmits<Emits>();

function openChannel() {
	emit("open-room", props.data.channel);
}
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p v-if="isCurrentClient">
		* <strong>Vous</strong> avez invité <bdo>{{ data.nick }}</bdo> à
		rejoindre le salon <span>{{ data.channel }}</span>
	</p>
	<p v-else>
		<bdo>{{ data.nick }}</bdo> a été invité à rejoindre le salon
		<span @dblclick="openChannel">{{ data.channel }}</span>
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

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

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
const props = defineProps<Props<"KICK">>();

const emit = defineEmits<Emits>();

const openChannel = () => emit("open-room", props.data.channel);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		* Kicks:
		<bdo>{{ data.knick.nickname }}</bdo>
		a été sanctionné par
		<bdo>{{ data.origin.nickname }}</bdo>
		(Raison: <q>{{ data.reason }}</q
		>)
	</p>
	<span v-if="isCurrentClient" @dblclick="openChannel"
		>({{ data.channel }})</span
	>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--room-event-kick-color);
}

bdo {
	color: var(--default-text-color);
}

span {
	cursor: pointer;
}
</style>

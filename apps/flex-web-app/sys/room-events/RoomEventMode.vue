<script setup lang="ts">
import { computed } from "vue";

import { type Props } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"MODE">>();

const addedModesKeys = computed(() => Object.keys(props.data.added));
const hasAddedModes = computed(() => addedModesKeys.value.length > 0);

const removedModesKeys = computed(() => Object.keys(props.data.removed));
const hasRemovedModes = computed(() => removedModesKeys.value.length > 0);

const updatedBy = computed(() => {
	const x = Object.values(props.data.added).at(-1)?.[1].updated_by;
	const y = Object.values(props.data.removed).at(-1)?.[1].updated_by;
	return x || y;
});

const settingsWord = computed(() =>
	props.data.target.startsWith("#")
		? "Paramètres du salon"
		: "Modes utilisateur"
);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		<template v-if="!data.updated">* {{ settingsWord }}: </template>
		<template v-else>
			*
			<bdo>{{ updatedBy }}</bdo>
			a défini les modes:
		</template>

		<output v-if="hasAddedModes">+</output>
		<output v-for="[letter, _] of data.added">
			{{ letter }}
		</output>

		<output v-if="hasRemovedModes">-</output>
		<output v-for="[letter, _] of data.removed">
			{{ letter }}
		</output>
		{{ " " }}
		<bdo v-for="[_, mode] of data.added">
			{{ mode.args.join(" ") }}{{ " " }}
		</bdo>
		{{ " " }}
		<bdo v-for="[_, mode] of data.removed">
			{{ mode.args.join(" ") }}{{ " " }}
		</bdo>
	</p>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

p {
	color: var(--room-event-mode-color);
}

bdo,
output,
span {
	color: var(--default-text-color);
}
</style>

<script setup lang="ts">
import type { Props } from "./RoomEvent.state";

import { computed } from "vue";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props<"MODE">>();

let added_modes_keys = computed(() => Object.keys(props.data.added));
let has_added_modes = computed(() => added_modes_keys.value.length > 0);

let removed_modes_keys = computed(() => Object.keys(props.data.removed));
let has_removed_modes = computed(() => removed_modes_keys.value.length > 0);

let updated_by = computed(() => {
	let x = Object.values(props.data.added).at(-1)?.[1].updated_by;
	let y = Object.values(props.data.removed).at(-1)?.[1].updated_by;
	return x || y;
});

let settings_word = computed(() =>
	props.data.target.startsWith("#")
		? "Paramètres du salon"
		: "Modes utilisateur",
);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formattedTime }}
	</time>
	<p>
		<template v-if="!data.updated">* {{ settings_word }}: </template>
		<template v-else>
			*
			<bdo>{{ updated_by }}</bdo>
			a défini les modes:
		</template>

		<output v-if="has_added_modes">+</output>
		<output v-for="[letter, _] of data.added">
			{{ letter }}
		</output>

		<output v-if="has_removed_modes">-</output>
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

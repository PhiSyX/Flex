<script setup lang="ts">
import type { TextEditEmits } from "@phisyx/flex-uikit/textedit/emits";
import type { TextEditProps } from "@phisyx/flex-uikit/textedit/props";

import { nextTick, ref, useTemplateRef } from "vue";

const {
	contentCenter = false,
	placeholderCenter = true,
	withLayer = false,
	locked,
} = defineProps<TextEditProps>();
const emit = defineEmits<TextEditEmits>();
let input_model = defineModel<string>();

let state = ref(false);
let $input = useTemplateRef("$input");

// ------- //
// Handler //
// ------- //

function submit_handler(evt: Event) {
	state.value = false;
	emit("submit");

	if (withLayer) {
		evt.preventDefault();
		toggle_layer(evt);
	}
}

function open_layer(evt: Event) {
	if (locked) {
		return;
	}

	state.value = true;

	if (withLayer) {
		toggle_layer(evt);
	}
}

function toggle_layer(evt: Event) {
	nextTick(() => {
		$input.value?.focus();

		emit("layer", {
			event: evt,
			linked_element: $input.value as HTMLInputElement,
			mode: state.value,
		});
	});
}
</script>

<template>
	<input
		v-if="state"
		ref="$input"
		v-model="input_model"
		:class="{
			'align-t:center': contentCenter,
		}"
		class="fx:text-edit [ input:reset size:full ]"
		type="text"
		@blur="submit_handler"
		@keydown.enter="submit_handler"
		@keydown.esc="submit_handler"
	/>
	<output
		v-else-if="content.length > 0"
		:class="{
			'cursor:default': locked,
			'cursor:pointer': !locked,
		}"
		class="[ display-ib size:full p=1 select:none ]"
		@dblclick="open_layer"
	>
		{{ content }}
	</output>
	<p
		v-else-if="placeholder"
		:class="{
			'cursor:default': locked,
			'cursor:pointer': !locked,
			'flex/center:full': placeholderCenter,
		}"
		class="[ flex h:full my=0 select:none ]"
		@dblclick="open_layer"
	>
		{{ placeholder }}
	</p>
</template>

<style scoped lang="scss">
@import "@phisyx/flex-uikit-stylesheets/textedit/TextEdit.scss";
</style>

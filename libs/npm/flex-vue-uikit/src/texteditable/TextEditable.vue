<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	content: string;
	contentCenter?: boolean;
	placeholder?: string;
	placeholderCenter?: boolean;
	locked: boolean;
	withLayer?: boolean;
}

interface Emits {
	(
		evt_name: "layer",
		_: {
			event: Event;
			linked_element: HTMLInputElement;
			mode: boolean;
		}
	): void;
	(evt_name: "submit"): void;
}

// --------- //
// Composant //
// --------- //

const {
	contentCenter = false,
	placeholderCenter = true,
	withLayer = false,
	locked,
} = defineProps<Props>();
const emit = defineEmits<Emits>();
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
		class="[ input:reset size:full ]"
		:class="{
			'align-t:center': contentCenter,
		}"
		type="text"
		@blur="submit_handler"
		@keydown.enter="submit_handler"
		@keydown.esc="submit_handler"
	/>
	<output
		v-else-if="content.length > 0"
		class="[ display-ib size:full p=1 select:none ]"
		:class="{
			'cursor:default': locked,
			'cursor:pointer': !locked,
		}"
		@dblclick="open_layer"
	>
		{{ content }}
	</output>
	<p
		v-else-if="placeholder"
		class="[ flex h:full my=0 select:none ]"
		:class="{
			'cursor:default': locked,
			'cursor:pointer': !locked,
			'flex/center:full': placeholderCenter,
		}"
		@dblclick="open_layer"
	>
		{{ placeholder }}
	</p>
</template>

<script setup lang="ts">
import type { InputCounterProps } from "@phisyx/flex-uikit/input/props";

import { set_caret_contenteditable } from "@phisyx/flex-helpers/contenteditable";
import {
	decrement_input_counter,
	increment_input_counter,
	replace_input_counter,
} from "@phisyx/flex-uikit/input/handler";
import { nextTick } from "vue";

const {
	disabled = false,
	min = Number.MIN_SAFE_INTEGER,
	max = Number.MAX_SAFE_INTEGER,
	step = 1,
	stepX10WithShift = true,
} = defineProps<InputCounterProps>();

let input_model = defineModel<number>({ required: true });

function decrement_handler(evt: Event & { shiftKey: boolean }) {
	let maybe_number = decrement_input_counter(evt, input_model.value, {
		disabled: disabled,
		max,
		min,
		step,
		stepX10WithShift,
	});

	if (maybe_number === undefined) {
		return;
	}

	input_model.value = maybe_number;
}

function increment_handler(evt: Event & { shiftKey: boolean }) {
	let maybe_number = increment_input_counter(evt, input_model.value, {
		disabled: disabled,
		max,
		min,
		step,
		stepX10WithShift,
	});

	if (maybe_number === undefined) {
		return;
	}

	input_model.value = maybe_number;
}

function input_handler(evt: Event) {
	let maybe_output = replace_input_counter(evt, input_model.value, {
		disabled,
		max,
		min,
	});

	if (maybe_output === undefined) {
		return;
	}

	input_model.value = maybe_output.value;

	nextTick(() => {
		set_caret_contenteditable(
			evt.target as HTMLOutputElement,
			maybe_output.pos,
		);
	});
}
</script>

<template>
	<div
		:disabled="disabled ? 'disabled' : undefined"
		class="fx:inputcounter [ flex:shrink=0 flex flex/center:full gap=4px border/radius=20px ]"
		@keydown.up="increment_handler"
		@keydown.down="decrement_handler"
	>
		<button
			:disabled="disabled || input_model === min"
			type="button"
			title="Décrémenter"
			class="[ cursor:pointer button:reset ml=1 mr=4px my=4px ]"
			@click="decrement_handler"
		>
			-
		</button>
		<output contenteditable="true" @input="input_handler">
			{{ input_model }}
		</output>
		<button
			:id="name"
			:disabled="disabled || input_model === max"
			type="button"
			title="Incrémenter"
			class="[ cursor:pointer button:reset mr=1 ml=4px ]"
			@click="increment_handler"
		>
			+
		</button>
		<input type="hidden" :name="name" :value="input_model" :form="form" />
	</div>
</template>

<style scoped lang="scss">
@use "@phisyx/flex-uikit-stylesheets/input/InputCounter.scss";
</style>

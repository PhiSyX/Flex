<script setup lang="ts">
import { nextTick } from "vue";

import {
	get_caret_contenteditable,
	minmax,
	set_caret_contenteditable,
} from "@phisyx/flex-helpers";

// ---- //
// Type //
// ---- //

interface Props
{
	disabled?: boolean;
	form?: string;
	name: string;
	min?: number;
	max?: number;
	step?: number;
	stepX10WithShift?: boolean;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	min: Number.MIN_SAFE_INTEGER,
	max: Number.MAX_SAFE_INTEGER,
	step: 1,
	stepX10WithShift: true,
});

let input_model = defineModel<number>({ required: true });

function decrement_handler(evt: Event & { shiftKey: boolean })
{
	evt.preventDefault();
	if (props.disabled) {
		return;
	}
	let step = props.stepX10WithShift && evt.shiftKey ? 10 : props.step;
	input_model.value = minmax(input_model.value - step, props.min, props.max);
}

function increment_handler(evt: Event & { shiftKey: boolean })
{
	evt.preventDefault();
	if (props.disabled) {
		return;
	}
	let step = props.stepX10WithShift && evt.shiftKey ? 10 : props.step;
	input_model.value = minmax(input_model.value + step, props.min, props.max);
}

function input_handler(evt: Event)
{
	let target = evt.target as HTMLOutputElement & { value: string };
	let pos = get_caret_contenteditable(target);

	let fallback = () => {
		target.value = (Number.parseInt(input_model.value.toFixed(), 10) || 0).toFixed();

		set_caret_contenteditable(target, {
			start: pos.start,
			end: pos.end - 1,
			selected_text: pos.selected_text,
		});
	};

	if (props.disabled) {
		fallback();
		return;
	}

	let matches = target.value.match(/[^\d]/) ?? [];

	if (matches.length > 0) {
		fallback();
		return;
	}

	let val = Number.parseInt(target.value, 10) || 0;
	input_model.value = minmax(val, props.min, props.max);
	target.value = input_model.value.toFixed();
	nextTick(() => {
		set_caret_contenteditable(target, pos);
	});
}
</script>

<template>
	<div
		:disabled="disabled ? 'disabled' : undefined"
		class="input@counter [ flex:shrink=0 flex flex/center:full ]"
		@keydown.up="increment_handler"
		@keydown.down="decrement_handler"
	>
		<button
			:disabled="disabled || input_model === min"
			type="button"
			title="Décrémenter"
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
			@click="increment_handler"
		>
			+
		</button>
		<input type="hidden" :name="name" :value="input_model" :form="form">
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("input@counter") {
	gap: 4px;
	border: 1px solid #d8af20;
	border-radius: 20px;
	box-shadow: 2px 2px 4px var(--color-blue-grey700);

	@include fx.scheme using ($name) {
		@if $name == light {
			border-color: #d8af20;
			background: linear-gradient(90deg, #b69a36 0%, #d8af20 100%);
		} @else if $name == ice {
			border-color: var(--color-blue-grey200);
			background: linear-gradient(
				90deg,
				var(--color-blue-grey400) 0%,
				var(--color-blue-grey200) 100%
			);
		} @else if $name == dark {
			border-color: #d8af20;
			background: linear-gradient(90deg, #b69a36 0%, #d8af20 100%);
		}
	}
}

button {
	cursor: pointer;
}
div[disabled],
output[disabled],
button[disabled] {
	opacity: 0.75;
	pointer-events: none;
}
button:first-of-type {
	margin-left: 4px;
	border: 0;
	background: transparent;
}
button:last-of-type {
	margin-right: 4px;
	border: 0;
	background: transparent;
}
</style>

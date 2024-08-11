<script setup lang="ts">
import type { Emits } from "./RoomEditbox.handlers";
import type { Props } from "./RoomEditbox.state";

import { computed, onActivated as on_activated } from "vue";

import { ButtonIcon, UiButton } from "@phisyx/flex-vue-uikit";

import { change_nick, on_submit, open_colors_box } from "./RoomEditbox.handlers";
import { use_autocompletion, use_input_history } from "./RoomEditbox.hooks";
import { $input, input_model } from "./RoomEditbox.state";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let form_action = computed(() => {
	let target_path = props.room.name.startsWith("#")
		? `%23${props.room.name.slice(1).toLowerCase()}`
		: props.room.name.toLowerCase();
	return `/msg/${target_path}`;
});

// --------- //
// Lifecycle // -> Hooks
// --------- //

const {
	keydown_handler: history_keydown_handler,
	submit_handler: history_submit_handler
} = use_input_history(props);
const {
	apply_suggestion_handler,
	input_handler: autocompletion_input_handler,
	keydown_handler: autocompletion_keydown_handler,
	submit_handler: autocompletion_submit_handler,
	suggestion_input: suggestionInput,
} = use_autocompletion(props);

on_activated(() => {
	$input.value?.focus();
});

// ------- //
// Handler //
// ------- //

const change_nick_handler = change_nick(emit);
const open_colors_box_handler = open_colors_box(emit);

function submit_handler()
{
	history_submit_handler();
	autocompletion_submit_handler();
	on_submit(emit, props)();
}
</script>

<template>
	<form
		:action="form_action"
		method="POST"
		:disabled="disableInput ? 'disabled' : undefined"
		class="[ p=1 pl=0 ]"
		@submit.prevent="submit_handler"
	>
		<input type="hidden" name="target" :value="room.name" />

		<div class="[ flex align-i:center h:full gap=2 px=1 ]">
			<UiButton
				variant="primary"
				class="btn-change-nick [ max-w=12 display-i align-jc:stretch my=1 px=1 py=1 border/radius=1 ... ]"
				:title="currentClientNickname"
				@click="change_nick_handler"
			>
				{{ currentClientNickname }}
			</UiButton>

			<div class="[ pos-r flex:full ]">
				<input
					:disabled="true"
					:placeholder="suggestionInput"
					type="search"
					class="[ pos-a:full input:reset size:full py=1 ]"
					:class="{
						'text-bold': bold,
						'text-italic': italic,
						'text-underline': underline,
					}"
				/>

				<input
					ref="$input"
					v-model="input_model"
					:disabled="disableInput"
					:placeholder="placeholder"
					:class="{
						[`fg-color${foreground}`]: foreground && foreground >= 0,
						[`fshadow-color${background}`]: background !== null,
						'text-bold': bold,
						'text-italic': italic,
						'text-underline': underline,
					}"
					class="[ input:reset flex:shrink=0 size:full py=1 ]"
					type="text"
					@keydown.down="history_keydown_handler"
					@keydown.up="history_keydown_handler"
					@keydown="autocompletion_keydown_handler"
					@input="autocompletion_input_handler"
				/>
			</div>

			<UiButton
				v-if="suggestionInput"
				class="btn-suggestion"
				@click="apply_suggestion_handler"
			>
				↹ Tab
			</UiButton>

			<ButtonIcon
				
				icon="text-color"
				:disabled="disableInput" 
				:class="{
					[`fg-color${foreground}`]: foreground && foreground >= 0,
					[`fshadow-color${background}`]: background !== null,
				}"
				@click="open_colors_box_handler"
				
			/>

			<ButtonIcon
				icon="send"
				type="submit"
				:disabled="disableInput"
				title="Soumettre le message"
			/>
		</div>
	</form>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

form {
	&[disabled],
	&[disabled] * {
		cursor: not-allowed !important;
		user-select: none;
	}
}

div {
	background-color: var(--room-editbox-bg);
	border-radius: 4px;
}

input[type="search"],
input[type="text"] {
	font-size: 14px;
}
input[type="text"] {
	position: relative;
	z-index: 1;
}
input[type="search"] {
	z-index: 0;
}

input[type="text"]::placeholder {
	color: var(--default-placeholder-color) !important;
	font-style: initial !important;
	text-decoration: initial !important;
	font-weight: initial !important;
}

.btn-suggestion {
	font-size: 14px;
	padding: 4px;
	border: 1px solid var(--body-bg_alt);
	border-radius: 4px;
}

.btn-change-nick {
	font-size: 14px;

	@include fx.scheme using ($name) {
		@if $name == dark {
			--btn-primary-bg: var(--body-bg);
		} @else {
			--btn-primary-bg: var(--body-bg_alt);
		}
	}
}
</style>

<script setup lang="ts">
import { computed, onActivated, ref } from "vue";

import { ButtonIcon } from "@phisyx/flex-uikit";

// ---- //
// Type //
// ---- //

interface Props {
	disableInput?: boolean;
	// TODO: possibilité d'envoyer des messages avec des couleurs/mises en formes
	//background: color;
	//foreground: color;
	placeholder?: string;
	target: string;
}

interface Emits {
	(evtName: "submit", inputModel: string): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let $input = ref<HTMLInputElement>();
let inputModel = ref("");

const formAction = computed(() => {
	let target = props.target.startsWith("#")
		? `%23${props.target.slice(1).toLowerCase()}`
		: props.target.toLowerCase();
	return `/privmsg/${target}`;
});

// -------- //
// Fonction //
// -------- //

function submitHandler() {
	if (props.disableInput || inputModel.value.length === 0) {
		return;
	}
	emit("submit", inputModel.value);
	inputModel.value = "";
}

onActivated(() => {
	$input.value?.focus();
});
</script>

<template>
	<form
		:action="formAction"
		method="POST"
		:disabled="disableInput ? 'disabled' : undefined"
		@submit.prevent="submitHandler"
	>
		<input type="hidden" name="target" :value="target" />

		<div>
			<input
				ref="$input"
				v-model.trim="inputModel"
				:disabled="disableInput"
				:placeholder="placeholder"
				type="text"
			/>

			<ButtonIcon icon="text-color" :disabled="disableInput" />
			<ButtonIcon icon="send" type="submit" :disabled="disableInput" />
		</div>
	</form>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

form {
	min-height: fx.space(60);
	padding: fx.space(1);
	padding-left: 0;

	&[disabled],
	&[disabled] * {
		cursor: not-allowed !important;
		user-select: none;
	}
}

div {
	display: flex;
	align-items: center;
	height: 100%;
	gap: fx.space(2);
	padding-inline: fx.space(1);

	background-color: var(--room-editbox-bg);
	border-radius: 4px;
}

input[type="text"] {
	flex-grow: 1;

	font-size: 14px;

	height: 100%;

	padding: 0;
	padding-block: fx.space(1);
	border: 0;
	background: transparent;
	color: inherit;
	outline: none;
}
</style>

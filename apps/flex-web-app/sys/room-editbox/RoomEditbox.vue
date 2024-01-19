<script setup lang="ts">
import { ButtonIcon } from "@phisyx/flex-uikit";

import { onActivated } from "vue";

import { onSubmit } from "./RoomEditbox.handlers";
import { $input, computeFormAction, inputModel } from "./RoomEditbox.state";

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

const formAction = computeFormAction(props);
const submitHandler = onSubmit(emit, props);

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
				class="[ input:reset ]"
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
	padding-block: fx.space(1);
}
</style>

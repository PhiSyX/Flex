<script setup lang="ts">
import { ButtonIcon, UiButton } from "@phisyx/flex-uikit";

import { onActivated } from "vue";

import { useInputHistory } from "./RoomEditbox.hooks";
import { type Emits, changeNick, onSubmit } from "./RoomEditbox.handlers";
import {
	type Props,
	$input,
	computeFormAction,
	inputModel,
} from "./RoomEditbox.state";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formAction = computeFormAction(props);

const changeNickHandler = changeNick(emit);
const { keydownHandler, submitHandler } = useInputHistory(
	props,
	onSubmit(emit)
);

onActivated(() => {
	$input.value?.focus();
});
</script>

<template>
	<form
		:action="formAction"
		method="POST"
		:disabled="disableInput ? 'disabled' : undefined"
		class="[ p=1 pl=0 ]"
		@submit.prevent="submitHandler()"
	>
		<input type="hidden" name="target" :value="target" />

		<div class="[ flex align-i:center h:full gap=2 px=1 ]">
			<UiButton
				class="btn-change-nick [ my=1 px=1 py=1 border/radius=1 ]"
				@click="changeNickHandler"
			>
				{{ nick }}
			</UiButton>

			<input
				ref="$input"
				v-model.trim="inputModel"
				:disabled="disableInput"
				:placeholder="placeholder"
				type="text"
				class="[ input:reset flex:full h:full py=1 ]"
				@keydown="keydownHandler"
			/>

			<ButtonIcon icon="text-color" :disabled="disableInput" />
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

input[type="text"] {
	font-size: 14px;
}

.btn-change-nick {
	font-size: 14px;
	background: var(--body-bg_alt);
}
</style>

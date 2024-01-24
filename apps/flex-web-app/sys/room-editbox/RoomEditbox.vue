<script setup lang="ts">
import { ButtonIcon } from "@phisyx/flex-uikit";

import { onActivated } from "vue";

import { onSubmit } from "./RoomEditbox.handlers";
import {
	type Props,
	$input,
	computeFormAction,
	inputModel,
} from "./RoomEditbox.state";

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
		class="[ min-h=8 p=1 pl=0 ]"
		@submit.prevent="submitHandler"
	>
		<input type="hidden" name="target" :value="target" />

		<div class="[ flex align-i:center h:full gap=2 px=1 ]">
			<input
				ref="$input"
				v-model.trim="inputModel"
				:disabled="disableInput"
				:placeholder="placeholder"
				type="text"
				class="[ input:reset flex:full h:full py=1 ]"
			/>

			<ButtonIcon icon="text-color" :disabled="disableInput" />
			<ButtonIcon icon="send" type="submit" :disabled="disableInput" />
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
</style>

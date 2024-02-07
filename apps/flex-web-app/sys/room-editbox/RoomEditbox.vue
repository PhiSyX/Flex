<script setup lang="ts">
import { ButtonIcon, UiButton } from "@phisyx/flex-uikit";

import { onActivated } from "vue";

import { useAutocompletion, useInputHistory } from "./RoomEditbox.hooks";
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
const { historyKeydownHandler, submitHandler } = useInputHistory(
	props,
	onSubmit(emit)
);
const {
	applySuggestionHandler,
	autocompletionInputHandler,
	autocompletionKeydownHandler,
	suggestionInput,
} = useAutocompletion(props);

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
				variant="primary"
				class="btn-change-nick [ my=1 px=1 py=1 border/radius=1 ]"
				@click="changeNickHandler"
			>
				{{ nick }}
			</UiButton>

			<div class="[ pos-r flex:full ]">
				<input
					:disabled="true"
					:placeholder="suggestionInput"
					type="search"
					class="[ pos-a:full input:reset h:full py=1 ]"
				/>

				<input
					ref="$input"
					v-model="inputModel"
					:disabled="disableInput"
					:placeholder="placeholder"
					type="text"
					class="[ input:reset h:full w:full py=1 ]"
					@keydown.down="historyKeydownHandler"
					@keydown.up="historyKeydownHandler"
					@keydown="autocompletionKeydownHandler"
					@input="autocompletionInputHandler"
				/>
			</div>

			<UiButton
				v-if="suggestionInput"
				class="btn-suggestion"
				@click="applySuggestionHandler"
			>
				↹ Tab
			</UiButton>

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

.btn-suggestion {
	font-size: 14px;
	padding: 4px;
	border: 1px solid var(--body-bg_alt);
	border-radius: 4px;
}

.btn-change-nick {
	--btn-primary-bg: var(--body-bg_alt);
	font-size: 14px;
}
</style>

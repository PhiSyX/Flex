<script setup lang="ts">
import { ref } from "vue";

import { Dialog, UiButton } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props
{
	layerName: string;
}

interface Emits
{
	(event_name: "close"): void;
	(event_name: "submit", nickname: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

let new_nickname_request = ref("");

// ------- //
// Handler //
// ------- //

function change_nickname_handler()
{
	if (!new_nickname_request.value) {
		return;
	}

	emit("submit", new_nickname_request.value);
}
</script>

<template>
	<Dialog @close="emit('close')">
		<template #label>Changer son pseudonyme</template>

		<template #footer>
			<em>
				Les champs ayant un <span>*</span>asterisk sont obligatoires.
			</em>

			<UiButton
				type="submit"
				variant="primary"
				class="[ ml=1 mt=1 ]"
				:form="`${layerName}_form`"
				@click="change_nickname_handler"
			>
				Changer maintenant
			</UiButton>
		</template>

		<form
			:id="`${layerName}_form`"
			action="/chat/nick"
			method="post"
			@submit.prevent="change_nickname_handler"
		>
			<table class="[ w:full ]">
				<tr>
					<td>
						<span>* </span>
						<label for="nickname">Nouveau pseudo:</label>
					</td>
					<td>
						<input
							id="nickname"
							v-model="new_nickname_request"
							placeholder="JohnDoe"
							required
							type="text"
							class="[ input:reset p=1 w:full ]"
						/>
					</td>
				</tr>
			</table>
		</form>
	</Dialog>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

input {
	--default-placeholder-color: var(--color-grey900);
	background: var(--color-ultra-white);
	color: var(--color-black);
	&:placeholder-shown {
		color: var(--default-placeholder-color);
	}
}

em {
	font-size: 12px;
	vertical-align: text-bottom;
}

span {
	color: var(--color-red500);
}

button[type="submit"] {
	--btn-primary-bg: var(--color-ultra-white);
	--btn-primary-bg-hover: var(--color-white);
	--btn-primary-color: var(--color-black);
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	&:hover {
		outline: 3px solid var(--dialog-border-color);
	}
}
</style>

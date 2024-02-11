<script setup lang="ts">
import { UiButton, Dialog } from "@phisyx/flex-uikit";

import { ref } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
}

interface Emits {
	(evtName: "close"): void;
	(evtName: "submit", nickname: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const newNickRequest = ref("");

function submitHandler() {
	emit("submit", newNickRequest.value);
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
				class="[ ml=1 ]"
				:form="`${layerName}_form`"
				@click="submitHandler()"
			>
				Changer maintenant
			</UiButton>
		</template>

		<form
			:id="`${layerName}_form`"
			action="/chat/nick"
			method="post"
			@submit.prevent="submitHandler()"
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
							v-model="newNickRequest"
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

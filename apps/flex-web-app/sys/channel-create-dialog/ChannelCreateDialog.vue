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
	(evtName: "submit", channels: string, keys: string): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const channelsRequest = ref("");
const keysRequest = ref("");

function submitHandler() {
	emit("submit", channelsRequest.value, keysRequest.value);
}
</script>

<template>
	<Dialog @close="emit('close')">
		<template #label>Rejoindre un salon</template>

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
				Rejoindre maintenant
			</UiButton>
		</template>

		<form
			:id="`${layerName}_form`"
			action="/chat/join/channel"
			method="post"
			@submit.prevent="submitHandler()"
		>
			<table class="[ w:full ]">
				<tr>
					<td>
						<span>* </span>
						<label for="channels">Noms des salons:</label>
					</td>
					<td>
						<input
							id="channels"
							v-model="channelsRequest"
							placeholder="#channel1,#channel2"
							required
							type="text"
							class="[ input:reset p=1 w:full ]"
						/>
					</td>
				</tr>

				<tr>
					<td>
						<span style="visibility: hidden">* </span>

						<label for="keys">Clés d'accès: </label>
					</td>
					<td>
						<input
							id="keys"
							v-model="keysRequest"
							name="keys"
							placeholder="key1,key2"
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

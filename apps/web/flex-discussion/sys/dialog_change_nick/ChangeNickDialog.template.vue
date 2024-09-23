<script setup lang="ts">
import { ref } from "vue";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import { Dialog } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
}

interface Emits {
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

function change_nickname_handler() {
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
			<em class="[ f-size=12px ]">
				Les champs ayant un <strong>*</strong>asterisk sont obligatoires.
			</em>

			<Button
				type="submit"
				variant="primary"
				class="[ ml=1 mt=1 ]"
				:form="`${layerName}_form`"
				@click="change_nickname_handler"
			>
				Changer maintenant
			</Button>
		</template>

		<form
			:id="`${layerName}_form`"
			action="/chat/nick"
			method="post"
			@submit.prevent="change_nickname_handler"
		>
			<fieldset class="[ w:full flex flex/center:full gap=1 p=0 m=0 ]">
				<p class="flex:shrink=0">
					<strong>* </strong>
					<label for="nickname">Nouveau pseudo:</label>
				</p>

				<input
					id="nickname"
					v-model="new_nickname_request"
					placeholder="JohnDoe"
					required
					type="text"
					class="[ input:reset p=1 w:full h=4 ]"
				/>
			</fieldset>
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

fieldset {
	border: 0;
}

em {
	vertical-align: text-bottom;
}

strong {
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

<script setup lang="ts">
import type { PrivateParticipant } from "@phisyx/flex-chat";

import { Dialog, UiButton } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props
{
	layerName: string;
	participant: PrivateParticipant;
}

interface Emits
{
	(event_name: "close"): void;
	(event_name: "submit"): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
	<Dialog :without-close="true">
		<template #footer>
			<UiButton
				type="submit"
				variant="primary"
				class="[ ml=1 mt=1 ]"
				@click="emit('submit')"
			>
				Accepter
			</UiButton>

			<UiButton
				type="cancel"
				variant="secondary"
				class="[ ml=1 mt=1 ]"
				@click="emit('close')"
			>
				Décliner
			</UiButton>
		</template>

		<div>
			<strong>{{ participant.nickname }}</strong> souhaite échanger
			textuellement avec vous.
		</div>
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
	vertical-align: text-bottom;
}

strong {
	color: var(--color-grey500);
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

button[type="cancel"] {
	--btn-secondary-bg: var(--color-red400);
	--btn-secondary-bg-hover: var(--color-red300);
	--btn-secondary-color: var(--color-black);
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	&:hover {
		outline: 3px solid var(--color-red500);
	}
}
</style>

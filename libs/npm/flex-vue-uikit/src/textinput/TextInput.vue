<script setup lang="ts">
import type { Icons } from "../icons";

import { LabelIcon } from "../icons";

// ---- //
// Type //
// ---- //

interface Props
{
	error?: string | null;
	label: Icons;
	name: string;
}

interface Slots
{
	"default": unknown;
	"icon": unknown;
}

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<Props>();
defineSlots<Slots>();

let input_model = defineModel();
</script>

<template>
	<div class="form-group [ flex! py=1 ]" :class="{ error: error }">
		<div class="[ flex align-ji:center gap=1 ]">
			<slot name="icon">
				<LabelIcon :for="name" :icon="label" />
			</slot>
			<input
				:id="name"
				v-model="input_model"
				type="text"
				v-bind="$attrs"
			/>
			<slot />
		</div>
		<p v-if="error" class="[ p:reset ml=4 ]">{{ error }}</p>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

.form-group {
	border: 1px dashed transparent;
}

p {
	font-size: 13px;
	font-style: italic;
}

.form-group.error {
	border-radius: 4px;
	color: var(--text-input-color-error);
	border-color: currentColor;
}
</style>

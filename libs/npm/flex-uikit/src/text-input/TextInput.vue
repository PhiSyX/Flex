<script setup lang="ts">
import { type Icons, LabelIcon } from "../icons";

interface Props {
	error?: string;
	label: Icons;
	modelValue: string;
	name: string;
}

defineOptions({ inheritAttrs: false });
defineProps<Props>();
const inputModel = defineModel();
</script>

<template>
	<div class="form-group" :class="{ error: error }">
		<div class="text-input">
			<LabelIcon :for="name" :icon="label" />
			<input
				:id="name"
				v-model="inputModel"
				type="text"
				v-bind="$attrs"
			/>
		</div>
		<p v-if="error">{{ error }}</p>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

.form-group {
	display: flex;
	flex-direction: column;
	padding-block: fx.space(1);
	border: 1px dashed transparent;
}

.text-input {
	display: flex;
	place-items: center;
	gap: fx.space(1);
}

p {
	margin: 0;
	margin-left: fx.space(4);

	font-style: italic;
}

.form-group.error {
	border-radius: 4px;
	color: var(--text-input-color-error);
	border-color: currentColor;
}
</style>

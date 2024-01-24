<script setup lang="ts">
import { type Icons, LabelIcon } from "../icons";

interface Props {
	error?: string | null;
	label: Icons;
	modelValue: string;
	name: string;
}

defineOptions({ inheritAttrs: false });
defineProps<Props>();
const inputModel = defineModel();
</script>

<template>
	<div class="form-group [ flex! py=1 ]" :class="{ error: error }">
		<div class="[ flex align-ji:center gap=1 ]">
			<LabelIcon :for="name" :icon="label" />
			<input
				:id="name"
				v-model="inputModel"
				type="text"
				v-bind="$attrs"
			/>
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

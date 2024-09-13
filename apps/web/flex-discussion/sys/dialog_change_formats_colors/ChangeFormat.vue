<script lang="ts" setup>
// ---- //
// Type //
// ---- //

interface Props {
	value: string;
}

interface Slots {
	default: unknown;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
defineSlots<Slots>();
let model = defineModel<boolean | null>();
</script>

<template>
	<label
		:for="`format-${value}`"
		:class="{
			[`text-${value}`]: true,
			'selected': model,
		}"
		class="[ f-size=14px p=1 ]"
	>
		<slot />

		<input
			v-model="model"
			:value="value"
			:id="`format-${value}`"
			type="checkbox"
			name="format"
			class="[ display-n ]"
		/>
	</label>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

label {
	padding-block: 6px;
	border: inset 2px transparent;
	border-radius: 2px;
	background: var(--dialog-change-formats-colors-color);

	&.selected {
		border-color: var(--dialog-border-color);
	}
}
</style>

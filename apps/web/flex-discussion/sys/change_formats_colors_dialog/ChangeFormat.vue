<script lang="ts" setup>
// ---- //
// Type //
// ---- //

interface Props
{
	value: string;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
let model = defineModel<boolean | null>();
</script>

<template>
	<label
		:for="`format-${value}`"
		:class="{
			[`text-${value}`]: true,
			'selected': model,
		}"
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
	font-size: 14px;
	padding-block: 6px;
	padding-inline: fx.space(1);
	border: inset 2px transparent;
	border-radius: 2px;
	background: var(--dialog-change-formats-colors-color);

	&.selected {
		border-color: var(--dialog-border-color);
	}
}
</style>
<script lang="ts" setup>
import { computed } from "vue";


// ---- //
// Type //
// ---- //

interface Props
{
	preset: number;
	type: string;
}

// --------- //
// Composant //
// --------- //

const props =defineProps<Props>();
let selected = defineModel<number | null>({ required: true });

let variant = computed(() => props.type === "foreground" ? "fg" : "bg");
</script>

<template>
	<label
		:for="`preset-${type}-${preset}`"
		:class="{
			[`${variant}-color${preset}`]: (
				variant === 'bg' ||
				variant === 'fg' && preset !== 0
			),
			[`tshadow-color${preset}`]: preset !== 0,
			'selected': preset === selected,
		}"
		class="[ align-t:center select:none ]"
		@click.ctrl="selected = null"
	>
		{{ preset }}

		<input
			v-model="selected"
			:value="preset"
			:id="`preset-${type}-${preset}`"
			type="radio"
			name="preset"
			class="[ display-n ]"
		/>
	</label>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

label {
	font-size: 14px;
	border-radius: 4px;
	background: var(--dialog-change-formats-colors-color);
	border: inset 2px transparent;
}

.selected {
	border-color: inherit;
	font-weight: bold;
}
</style>
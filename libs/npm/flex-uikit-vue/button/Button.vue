<script setup lang="ts">
import type { ButtonChildren } from "@phisyx/flex-uikit/button/children";
import type { ButtonProps } from "@phisyx/flex-uikit/button/props";

import { change_selected } from "@phisyx/flex-uikit/button/handler";
import { is_selected_button } from "@phisyx/flex-uikit/button/state";
import { computed } from "vue";

// --------- //
// Composant //
// --------- //

const {
	iconPosition = "left",
	type = "button",
	withOpacity = true,
	selected,
	value,
	falseValue,
	trueValue,
} = defineProps<ButtonProps>();
defineSlots<ButtonChildren>();

let selected_model = defineModel("selected");

let value$ = computed(() => value ?? trueValue);
let is_selected = computed(() => is_selected_button(value$.value, selected));

// ------- //
// Handler //
// ------- //

const click_handler = () => {
	let select = change_selected(
		{ selected, is_selected: is_selected.value },
		{ value: value$.value, falseValue, trueValue }
	);

	if (select === undefined) {
		return;
	}

	selected_model.value = select;
};
</script>

<template>
	<button
		:class="{
			'btn(:active)': is_selected,
			'btn/without-opacity': withOpacity === false,
			[`btn/${variant}`]: variant,
		}"
		:type="(type as HTMLButtonElement['type'])"
		class="btn [ flex:shrink=0 ]"
		@click="click_handler"
	>
		<template v-if="icon && iconPosition === 'left'">
			<component :is="`icon-${icon}`" v-bind="iconAttrs" />
		</template>
		<slot />
		<template v-if="icon && iconPosition === 'right'">
			<component :is="`icon-${icon}`" v-bind="iconAttrs" />
		</template>
	</button>
</template>

<style lang="scss">
@import "@phisyx/flex-uikit-stylesheets/button/Button.scss";
</style>

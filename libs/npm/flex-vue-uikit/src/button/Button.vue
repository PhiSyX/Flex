<script setup lang="ts">
import type { Icons } from "../icons";

import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	icon?: Icons;
	position?: "left" | "right";
	withOpacity?: boolean;
	value?: unknown;
	trueValue?: unknown;
	falseValue?: unknown;
	selected?: unknown;
	type?: HTMLButtonElement["type"] | "dialog";
	variant?: "primary" | "secondary" | "danger";
}

interface Slots {
	default: unknown;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	position: "left",
	withOpacity: true,
	type: "button",
});
defineSlots<Slots>();

let selected_model = defineModel("selected");

let value$ = computed(() => props.value ?? props.trueValue);

let is_selected = computed(() => {
	if (value$.value == null && props.selected == null) {
		return false;
	}
	return value$.value === props.selected;
});

// ------- //
// Handler //
// ------- //

function click_handler(_: MouseEvent) {
	if (value$.value == null && props.selected == null) {
		return;
	}

	if (is_selected.value) {
		if (props.falseValue != null) {
			selected_model.value = props.falseValue;
		} else {
			selected_model.value = value$.value;
		}
	} else {
		if (props.trueValue != null) {
			selected_model.value = props.trueValue;
		} else if (props.falseValue != null) {
			selected_model.value = props.falseValue;
		} else {
			selected_model.value = value$.value;
		}
	}
}
</script>

<template>
	<button
		class="btn flex:shrink=0"
		:class="{
			'btn(:active)': is_selected,
			'btn/without-opacity': withOpacity === false,
			[`btn/${variant}`]: variant,
		}"
		:type="(type as HTMLButtonElement['type'])"
		@click="click_handler"
	>
		<template v-if="position === 'left' && icon">
			<component :is="`icon-${icon}`" />
		</template>
		<slot />
		<template v-if="position === 'right' && icon">
			<component :is="`icon-${icon}`" />
		</template>
	</button>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@layer flex-uikit {
	.btn {
		position: relative;

		display: inline-flex;
		align-items: center;
		justify-content: center;

		padding: 0;

		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;

		transition: background 200ms;

		&::before {
			content: "";

			--position: calc(0rem - #{fx.space(1)} / 2);

			position: absolute;
			top: var(--position);
			right: var(--position);
			bottom: var(--position);
			left: var(--position);
		}
	}

	.btn:disabled {
		cursor: default;
		color: var(--disabled-color, #aaa);
		pointer-events: none;
	}

	.btn svg {
		width: 100%;
		height: 100%;

		transition: opacity 250ms;
		color: var(--btn-svg-color, currentColor);
	}

	.btn:not(.btn\/without-opacity) svg {
		opacity: 0.5;
	}

	.btn\(\:active\) svg,
	.btn:not(:disabled, .btn\/without-opacity):hover svg:hover {
		opacity: 1 !important;
		filter: drop-shadow(0px 0px 4.5px var(--btn-svg-color, currentColor));
	}

	.btn\/primary {
		background: var(--btn-primary-bg);
		color: var(--btn-primary-color);
		transition: outline 60ms ease-in-out;

		&:focus,
		&:hover {
			outline: var(--btn-primary-outline, 3px) solid
				var(--btn-primary-outline-color, currentColor);
			background: var(--btn-primary-bg-hover, var(--btn-primary-bg));
			color: var(--btn-primary-color-hover, var(--btn-primary-color));
		}
	}

	.btn\/secondary {
		background: var(--btn-secondary-bg);
		color: var(--btn-secondary-color);
		transition: outline 60ms ease-in-out;

		&:focus,
		&:hover {
			outline: var(--btn-secondary-outline, 3px) solid
				var(--btn-secondary-outline-color, currentColor);
			background: var(--btn-secondary-bg-hover, var(--btn-secondary-bg));
			color: var(--btn-secondary-color-hover, var(--btn-secondary-color));
		}
	}

	.btn\/danger {
		background: var(--btn-danger-bg, var(--color-red500));
		color: var(--btn-danger-color);
		transition: outline 60ms ease-in-out;

		&[disabled] {
			color: var(
				--btn-danger-disabled-color,
				var(--disabled-color, #aaa)
			);
		}

		&:focus,
		&:hover {
			outline: var(--btn-danger-outline, 3px) solid
				var(--btn-danger-outline-color, currentColor);
			background-color: var(--btn-danger-bg-hover, var(--color-red600));
			color: var(--btn-danger-color-hover, var(--btn-danger-color));
		}
	}
}
</style>

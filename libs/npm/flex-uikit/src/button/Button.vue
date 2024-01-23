<script setup lang="ts">
import { type Props, computeIsSelected } from "./Button.state";
import { handleClick } from "./Button.handler";

const props = withDefaults(defineProps<Props>(), {
	position: "left",
	withOpacity: true,
	type: "button",
});

const selectedModel = defineModel("selected");

const handleClickHandler = handleClick(props, selectedModel);
const isSelected = computeIsSelected(props);
</script>

<template>
	<button
		class="btn"
		:class="{
			'btn:active': isSelected,
			'btn/without-opacity': withOpacity === false,
			[`btn/${variant}`]: variant,
		}"
		:type="type"
		@click="handleClickHandler"
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

.btn\:active svg,
.btn:not(:disabled):hover svg:hover {
	opacity: 1 !important;
	filter: drop-shadow(0px 0px 4.5px var(--btn-svg-color, currentColor));
}

.btn\/primary {
	background: var(--btn-primary-bg);
	color: var(--btn-primary-color);
	&:hover {
		background: var(--btn-primary-bg-hover, var(--btn-primary-bg));
		color: var(--btn-primary-color-hover, var(--btn-primary-color));
	}
}

.btn\/secondary {
	background: var(--btn-secondary-bg);
	color: var(--btn-secondary-color);
	&:hover {
		background: var(--btn-secondary-bg-hover, var(--btn-secondary-bg));
		color: var(--btn-secondary-color-hover, var(--btn-secondary-color));
	}
}

.btn\/danger {
	background: var(--btn-danger-bg, var(--color-red500));
	color: var(--btn-danger-color);
	&[disabled] {
		color: var(--btn-danger-disabled-color, var(--disabled-color, #aaa));
	}
	&:hover {
		background-color: var(--btn-danger-bg-hover, var(--color-red600));
		color: var(--btn-danger-color-hover, var(--btn-danger-color));
	}
}
</style>

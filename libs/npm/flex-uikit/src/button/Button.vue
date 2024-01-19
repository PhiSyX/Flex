<script setup lang="ts">
import { type Props, computeIsSelected } from "./Button.state";
import { handleClick } from "./Button.handler";

const props = withDefaults(defineProps<Props>(), {
	position: "left",
	withOpacity: true,
});

const selectedModel = defineModel("selected");

const handleClickHandler = handleClick(props, selectedModel);
const isSelected = computeIsSelected(props);
</script>

<template>
	<button
		:class="{
			active: isSelected,
			'btn/without-opacity': withOpacity === false,
		}"
		class="btn"
		type="button"
		@click="handleClickHandler"
	>
		<template v-if="position === 'left'">
			<component :is="`icon-${icon}`" />
		</template>
		<slot />
		<template v-if="position === 'right'">
			<component :is="`icon-${icon}`" />
		</template>
	</button>
</template>

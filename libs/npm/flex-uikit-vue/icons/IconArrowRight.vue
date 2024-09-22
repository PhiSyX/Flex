<script setup lang="ts">
enum ArrowVariant {
	Simple = "simple",
	Chevron = "chevron",
}

interface Props {
	variant?: ArrowVariant;
}

withDefaults(defineProps<Props>(), {
	variant: ArrowVariant.Simple,
});
</script>

<template>
	<svg
		v-if="variant === ArrowVariant.Simple"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		fill="none"
		viewBox="0 0 24 24"
	>
		<path
			fill="currentColor"
			d="m8.29 16.88 4.59-4.59L8.29 7.7l1.42-1.41 6 6-6 6z"
		/>
	</svg>
	<svg
		v-else-if="variant === ArrowVariant.Chevron"
		width="20"
		height="30"
		viewBox="0 0 20 30"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M4.65845 11.175L5.83345 10L10.8334 15L5.83345 20L4.65845 18.825L8.47511 15L4.65845 11.175ZM9.65845 11.175L10.8334 10L15.8334 15L10.8334 20L9.65845 18.825L13.4751 15L9.65845 11.175Z"
			fill="currentColor"
		/>
	</svg>
</template>

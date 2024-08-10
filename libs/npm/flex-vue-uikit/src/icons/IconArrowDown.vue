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
			d="M7.41 8.58 12 13.17l4.59-4.59L18 10l-6 6-6-6z"
		/>
	</svg>
	<svg
		v-else-if="variant === ArrowVariant.Chevron"
		width="24"
		height="25"
		viewBox="0 0 24 25"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M16.5715 7.42857L12.0001 12L7.42868 7.42857"
			stroke="currentColor"
			stroke-width="1.14286"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M16.5715 11.9999L12.0001 16.5713L7.42868 11.9999"
			stroke="currentColor"
			stroke-width="1.14286"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</template>

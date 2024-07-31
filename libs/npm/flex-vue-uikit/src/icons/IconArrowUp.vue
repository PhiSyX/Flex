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
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M16.59 15.4205L12 10.8305L7.41 15.4205L6 14.0005L12 8.00053L18 14.0005L16.59 15.4205Z"
			fill="currentColor"
		/>
	</svg>
	<svg
		v-else-if="variant === ArrowVariant.Chevron"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M8.175 17L7 15.825L12 10.825L17 15.825L15.825 17L12 13.1833L8.175 17ZM8.175 12L7 10.825L12 5.825L17 10.825L15.825 12L12 8.18333L8.175 12V12Z"
			fill="currentColor"
		/>
	</svg>
</template>

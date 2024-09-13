<script setup lang="ts">
// ---- //
// Type //
// ---- //

interface Props {
	age: number | null;
	userFlag: string | null;
	from: string | undefined;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<span
		class="[ f-size=13px ]"
		:class="{
			'vis:h': age === null,
		}"
	>
		{{ age }} ans
	</span>

	<span
		class="[ f-size=13px f-family=emoji ]"
		:class="{
			'vis:h': userFlag === null,
		}"
		:title="from"
	>
		{{ userFlag }}
	</span>
</template>

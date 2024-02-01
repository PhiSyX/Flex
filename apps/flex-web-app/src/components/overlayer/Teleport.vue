<script setup lang="ts">
import { type Layer } from "~/store/OverlayerStore";

// ---- //
// Type //
// ---- //

type Props = {
	id: Layer["id"];
	layer: Layer;
};

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<div
		:id="`${id}_teleport`"
		tabindex="0"
		class="teleport [ pos-a:full flex! ]"
		:class="{
			'flex/center:full': layer.centered,
		}"
	/>
</template>

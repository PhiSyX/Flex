<script lang="ts" setup>
// ---- //
// Type //
// ---- //

interface Props 
{
	classes?: string;
	name: string;
	symbol?: string;
	tag?: keyof HTMLElementTagNameMap;
}

// --------- //
// Composant //
// --------- //

withDefaults(defineProps<Props>(), { tag: "span" });
</script>

<template>
	<component :is="tag" class="channel/name" :class="classes">
		<span class="channel/name:symbol">{{ symbol }}</span>
		<span :class="classes">{{ name }}</span>
	</component>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

@include fx.class("channel/name") {
	color: var(--room-target-color, var(--default-text-color));
	word-break: break-all;
	hyphens: manual;
	cursor: pointer;
}
</style>

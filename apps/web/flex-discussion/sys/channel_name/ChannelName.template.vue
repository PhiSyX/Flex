<script lang="ts" setup>
import type { HighestAccessLevelOutput } from "@phisyx/flex-chat";

import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props
{
	name: string;
	highestAccessLevel?: Partial<HighestAccessLevelOutput>;
	tag?: keyof HTMLElementTagNameMap;
}

// --------- //
// Composant //
// --------- //

const { highestAccessLevel, tag = "span" } = defineProps<Props>();

let classes = computed(() => highestAccessLevel?.class_name);
let symbol = computed(() => highestAccessLevel?.symbol);
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
	color: var(--room-target-color, var(--default-text-color_alt));
	word-break: break-all;
	hyphens: manual;
	cursor: pointer;
}
</style>

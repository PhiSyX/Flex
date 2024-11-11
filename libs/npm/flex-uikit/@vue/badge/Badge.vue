<script setup lang="ts">
import type { BadgeProps } from "@phisyx/flex-uikit/badge/props";
import type { BadgeChildren } from "@phisyx/flex-uikit/badge/children";
import { computed } from "vue";

const { color, size } = defineProps<BadgeProps>();
defineSlots<BadgeChildren>();

let root_element = computed(() => (size === "small" ? "small" : "span"));
</script>

<template>
	<component
		:is="root_element"
		:class="{
			'border/radius=1': color,
			'border/radius=3': !color,
			[`fx:badge/${color}`]: color,
			'fx:badge/shadowed': shadowed,
		}"
		class="fx:badge [ di-b align-t:center ]"
	>
		<slot />
	</component>
</template>

<style scoped lang="scss">
@use "@phisyx/flex-uikit-stylesheets/badge/Badge.scss";
</style>

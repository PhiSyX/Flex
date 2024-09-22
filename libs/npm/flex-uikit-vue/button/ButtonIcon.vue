<script setup lang="ts">
import type { ButtonIconProps } from "@phisyx/flex-uikit/button/props";

import { computed } from "vue";

const { icon, attributes = {} } = defineProps<ButtonIconProps>();

const dyn_component = computed(() => `icon-${icon}`);
</script>

<template>
	<button type="button" lass="btn [ flex:shrink=0 ]">
		<component :is="dyn_component" v-bind="attributes" />
	</button>
</template>

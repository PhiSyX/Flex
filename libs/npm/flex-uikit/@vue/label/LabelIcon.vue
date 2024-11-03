<script setup lang="ts">
import type { LabelIconProps } from "@phisyx/flex-uikit/label/props";

import { computed } from "vue";

const { icon, attributes = {} } = defineProps<LabelIconProps>();

const dyn_component = computed(() => `icon-${icon}`);
</script>

<template>
	<label>
		<component :is="dyn_component" v-bind="attributes" />
	</label>
</template>

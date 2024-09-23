<script setup lang="ts">
import type { BadgeChildren } from "@phisyx/flex-uikit/badge/children";

defineSlots<BadgeChildren>();
</script>

<template>
	<span class="fx:badge [ di-b align-t:center border/radius=3 ]">
		<slot />
	</span>
</template>

<style scoped lang="scss">
@import "@phisyx/flex-uikit-stylesheets/badge/Badge.scss";
</style>

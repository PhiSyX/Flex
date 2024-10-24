<script setup lang="ts">
import type { MenuChildren } from "@phisyx/flex-uikit/menu/children";

defineSlots<MenuChildren>();
</script>

<template>
	<menu
		class="fx:menu [ pos-r ov:h list:reset p=0 border/radius=1 f-size=13px f-family=nunito ]"
		role="menu"
	>
		<slot />
	</menu>
</template>

<style lang="scss" scoped>
@use "@phisyx/flex-uikit-stylesheets/menu/Menu.scss";
</style>

<script setup lang="ts">
import type { MenuItemChildren } from "@phisyx/flex-uikit/menu/children";
import type { MenuItemEmits } from "@phisyx/flex-uikit/menu/emits";
import type { MenuItemProps } from "@phisyx/flex-uikit/menu/props";

const { description } = defineProps<MenuItemProps>();
const emit = defineEmits<MenuItemEmits>();
defineSlots<MenuItemChildren>();

const action_handler = (evt: Event) => emit("click", evt);
</script>

<template>
	<li
		class="fx:menuitem [ flex flex/center:full m=2px p=1 cursor:pointer ]"
		tabindex="0"
		@click="action_handler"
		@keydown.space="action_handler"
		@keydown.enter="action_handler"
	>
		<div class="[ flex:full flex! ]">
			<label><slot /></label>
			<small v-if="description">{{ description }}</small>
		</div>

		<component
			v-if="icon"
			:is="`icon-${icon}`"
			class="[ flex:shrink=0 ]"
			width="16"
			height="16"
		/>
	</li>
</template>

<style lang="scss" scoped>
@use "@phisyx/flex-uikit-stylesheets/menu/MenuItem.scss";
</style>

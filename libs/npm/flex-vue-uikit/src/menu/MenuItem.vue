<script setup lang="ts">
import type { Icons } from "../icons";

// --------- //
// Interface //
// --------- //

interface Props
{
	icon?: Icons;
}

interface Emits
{
	// biome-ignore lint/style/useShorthandFunctionType: tkt
	(event_name: "click", event: Event): void;
}

interface Slots
{
	default: unknown;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

// ------- //
// Handler //
// ------- //

const action_handler = (evt: Event) => emit("click", evt);
</script>

<template>
	<li
		class="menu@item [ flex flex/center:full m=0 p=1 ]"
		tabindex="0"
		@click="action_handler"
		@keydown.space="action_handler"
		@keydown.enter="action_handler"
	>
		<label class="[ flex:full ]"><slot /></label>

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
@use "scss:~/flexsheets" as fx;

li {
	margin: 2px;

}
li:first-of-type {
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
}

li:last-of-type {
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
}

li:hover {
	background: var(--menu-item-bg-hover);
}
</style>

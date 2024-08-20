<script setup lang="ts">
import type { PrivateRoom } from "@phisyx/flex-chat";

import { computed } from "vue";
import PrivatesWaitingItem from "./PrivatesWaitingItem.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	list: Array<PrivateRoom>;
}

interface Emits
{
	// biome-ignore lint/style/useShorthandFunctionType: chut
	(event_name: "open-private", priv: Origin): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let input_placeholder_attribute = computed(() => {
	let plural = (props.list.length === 1) ? "" : "s";
	return `Filtrer: ${props.list.length} privé${plural}...`
});

// ------- //
// Handler //
// ------- //

const open_private_handler = (priv: Origin) => emit("open-private", priv);
</script>

<template>
	<div class="private/list [ flex:full ][ flex! gap=3 p=8 pt=1 ]">
		<h1 class="[ align-t:center ]">Privés en attente</h1>

		<input
			:placeholder="input_placeholder_attribute"
			type="search"
			class="[ input:reset p=1 border/radius=1 ]"
		/>

		<ul class="[ list:reset flex! gap=2 ov:a p=1 ]">
			<PrivatesWaitingItem
				v-for="priv of list"
				:key="priv.id()"
				:priv="priv"
				@open-private="open_private_handler"
			/>
		</ul>
	</div>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

input {
	background: var(--room-bg);
}
</style>

<script setup lang="ts">
import { ButtonIcon } from "@phisyx/flex-uikit";

import { Room } from "~/room/Room";

import { folded, navWidth } from "./NavigationArea.state";
import { type Emits, changeRoom, closeRoom } from "./NavigationArea.handlers";

import NavigationServer from "#/sys/navigation-server/NavigationServer.vue";

// ---- //
// Type //
// ---- //

interface Props {
	servers: Array<Server>;
}

interface Server {
	active: boolean;
	connected: boolean;
	folded: boolean;
	name: string;
	rooms: Array<Room>;
}

// --------- //
// Composant //
// --------- //
defineProps<Props>();
const emit = defineEmits<Emits>();

const changeRoomHandler = changeRoom(emit);
const closeRoomHandler = closeRoom(emit);
</script>

<template>
	<section class="navigation-area">
		<nav class="[ scroll:y ]">
			<NavigationServer
				v-for="server in servers"
				:container-folded="folded"
				:key="server.name"
				v-bind="server"
				@change-room="changeRoomHandler"
				@close-room="closeRoomHandler"
			/>
		</nav>

		<footer>
			<ButtonIcon
				:icon="folded ? 'arrow-right' : 'arrow-left'"
				@click="folded = !folded"
			/>

			<div v-show="!folded" title="TODO">
				<ButtonIcon icon="settings" disabled />
			</div>
		</footer>
	</section>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

section {
	display: flex;
	flex-direction: column;
	user-select: none;

	min-width: v-bind(navWidth);
	width: v-bind(navWidth);
	max-width: fx.space(255);
}

nav {
	flex-grow: 1;

	width: 100%;
	height: 100%;
}

footer {
	display: flex;
	gap: fx.space(1);
	height: fx.space(6);
	padding: fx.space(1);
}

footer div {
	flex-grow: 1;

	display: flex;
	place-content: center;
	place-items: center;
}
</style>

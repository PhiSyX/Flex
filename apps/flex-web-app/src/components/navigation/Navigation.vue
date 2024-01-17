<script setup lang="ts">
import NavigationArea from "#/sys/navigation-area/NavigationArea.vue";

import { computed } from "vue";

import { useChatStore } from "~/store/ChatStore";

const chatStore = useChatStore();

const servers = computed(() => {
	const network = chatStore.store.network();
	return [
		{
			active: network.isActive(),
			connected: network.isConnected(),
			folded: false,
			name: network.name,
			rooms: Array.from(chatStore.store.roomManager().rooms()),
		},
	];
});

function changeRoomHandler(name: string) {
	chatStore.changeRoom(name);
}
function closeRoomHandler(name: string) {
	chatStore.closeRoom(name);
}
</script>

<template>
	<NavigationArea
		:servers="servers"
		@change-room="changeRoomHandler"
		@close-room="closeRoomHandler"
	/>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;
</style>

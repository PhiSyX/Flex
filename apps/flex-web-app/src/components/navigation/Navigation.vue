<script setup lang="ts">
import { computed } from "vue";

import { useChatStore } from "~/store/ChatStore";

import NavigationArea from "#/sys/navigation-area/NavigationArea.vue";

const chatStore = useChatStore();

const servers = computed(() => {
	const network = chatStore.store.network();
	return [
		{
			active: network.isActive(),
			connected: network.isConnected(),
			folded: false,
			id: network.id(),
			name: network.name,
			rooms: chatStore.store.roomManager().rooms(),
		},
	];
});

function changeRoom(origin: Origin | string) {
	chatStore.changeRoom(origin);
}

function closeRoom(origin: Origin | string) {
	chatStore.closeRoom(origin);
}

function openChannelList() {
	chatStore.channelList();
}
</script>

<template>
	<NavigationArea
		:servers="servers"
		@change-room="changeRoom"
		@close-room="closeRoom"
		@open-channel-list="openChannelList"
	/>
</template>

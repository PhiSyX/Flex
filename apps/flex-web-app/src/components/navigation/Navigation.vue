<script setup lang="ts">
import NavigationArea from "#/sys/navigation-area/NavigationArea.vue";

import { servers } from "./Navigation.state";
import {
	changeRoomHandler,
	closeRoomHandler,
	openChannelListHandler,
} from "./Navigation.handlers";
</script>

<template>
	<NavigationArea
		:servers="servers"
		@change-room="changeRoomHandler"
		@close-room="closeRoomHandler"
		@open-channel-list="openChannelListHandler"
	/>
</template>

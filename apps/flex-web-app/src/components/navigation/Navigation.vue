<script setup lang="ts">
import NavigationArea from "#/sys/navigation-area/NavigationArea.vue";

import { servers } from "./Navigation.state";
import { changeRoomHandler, closeRoomHandler } from "./Navigation.handlers";
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

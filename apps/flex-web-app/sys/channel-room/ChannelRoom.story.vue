<script setup lang="ts">
import { ChannelUsers } from "~/channel/ChannelUsers";
import ChannelRoom from "./ChannelRoom.vue";

const channelName = "#channel";
const messages = [];
const users = new ChannelUsers();
</script>

<template>
	<Story title="Molecules/ChannelRoom" responsive-disabled>
		<Variant title="Default">
			<ChannelRoom
				:messages="messages"
				:name="channelName"
				:users="users"
			/>
		</Variant>
	</Story>
</template>

<style>
#app [data-v-app],
.histoire-generic-render-story {
	height: 100%;
	color: var(--default-text-color);
}

.room\/channel {
	height: 100%;
}
</style>

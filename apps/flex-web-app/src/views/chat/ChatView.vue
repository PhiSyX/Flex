<script setup lang="ts">
import { computed } from "vue";

import { useChatStore } from "~/store/ChatStore";

import Navigation from "~/components/navigation/Navigation.vue";
import ServerCustomRoom from "#/sys/server-custom-room/ServerCustomRoom.vue";

const chatStore = useChatStore();

const rooms = computed(() => chatStore.store.roomManager().rooms());
const forumURL = import.meta.env.VITE_APP_FORUM_URL || "#";
const vademecumURL = import.meta.env.VITE_APP_VADEMECUM_URL || "#";

// -------- //
// Handlers //
// -------- //

function sendMessageHandler(name: string, message: string) {
	chatStore.sendMessage(name, message);
}
</script>

<template>
	<main id="chat-view">
		<Navigation />

		<div class="room">
			<template v-for="room in rooms" :key="room.id">
				<template
					v-if="room.type === 'server-custom-room'"
					:key="room.type + '-' + room.name"
				>
					<KeepAlive :key="room.type + '-' + room.name">
						<ServerCustomRoom
							v-if="room.isActive()"
							:forum-url="forumURL"
							:messages="room.messages"
							:name="room.name"
							:vademecum-url="vademecumURL"
							@send-message="sendMessageHandler"
						/>
					</KeepAlive>
				</template>
			</template>
		</div>
	</main>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

main {
	display: flex;

	height: 100%;
}

.room {
	flex-grow: 1;

	display: flex;
}

.room > div {
	flex-grow: 1;
}
</style>

<script setup lang="ts">
import { ChannelRoom } from "~/channel/ChannelRoom";
import { PrivateRoom } from "~/private/PrivateRoom";

import { rooms, forumURL, vademecumURL } from "./ChatView.state";
import { sendMessageHandler } from "./ChatView.handlers";

import Navigation from "~/components/navigation/Navigation.vue";
import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";
import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";

import ServerCustomRoom from "#/sys/server-custom-room/ServerCustomRoom.vue";
</script>

<template>
	<main id="chat-view">
		<Navigation />

		<div class="room">
			<template v-for="room in rooms" :key="room.id">
				<template
					v-if="room.type === 'server-custom-room'"
					:key="room.type + '@' + room.name"
				>
					<KeepAlive :key="room.type + '@' + room.name">
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
				<template
					v-else-if="room.type === 'channel'"
					:key="room.type + ':' + room.name"
				>
					<KeepAlive :key="room.type + ':' + room.name">
						<ChannelRoomComponent
							v-if="room.isActive()"
							:room="(room as ChannelRoom)"
						/>
					</KeepAlive>
				</template>
				<template
					v-else-if="room.type === 'private'"
					:key="room.type + '/' + room.name"
				>
					<KeepAlive :key="room.type + '/' + room.name">
						<PrivateRoomComponent
							v-if="room.isActive()"
							:room="(room as PrivateRoom)"
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

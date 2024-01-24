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
	<main id="chat-view" class="[ flex h:full ]">
		<Navigation />

		<div class="room [ flex:full flex ]">
			<template v-for="room in rooms" :key="room.id">
				<template
					v-if="room.type === 'server-custom-room'"
					:key="room.type + '@' + room.name"
				>
					<KeepAlive :key="room.type + '@' + room.name">
						<ServerCustomRoom
							v-if="room.isActive() && !room.isClosed()"
							:forum-url="forumURL"
							:messages="room.messages"
							:name="room.name"
							:vademecum-url="vademecumURL"
							class="[ flex:full ]"
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
							v-if="room.isActive() && !room.isClosed()"
							:room="(room as ChannelRoom)"
							class="[ flex:full ]"
						/>
					</KeepAlive>
				</template>
				<template
					v-else-if="room.type === 'private'"
					:key="room.type + '/' + room.name"
				>
					<KeepAlive :key="room.type + '/' + room.name">
						<PrivateRoomComponent
							v-if="room.isActive() && !room.isClosed()"
							:room="(room as PrivateRoom)"
							class="[ flex:full ]"
						/>
					</KeepAlive>
				</template>
			</template>
		</div>
	</main>
</template>

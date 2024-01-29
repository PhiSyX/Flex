<script setup lang="ts">
import { Alert } from "@phisyx/flex-uikit";

import { ChannelRoom } from "~/channel/ChannelRoom";
import { PrivateRoom } from "~/private/PrivateRoom";
import { ChannelListCustomRoom } from "~/custom-room/ChannelListCustomRoom";
import { useChatStore } from "~/store/ChatStore";

import { rooms, forumURL, vademecumURL } from "./ChatView.state";
import { joinChannelHandler, sendMessageHandler } from "./ChatView.handlers";

import Navigation from "~/components/navigation/Navigation.vue";
import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";
import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";

import Match from "#/sys/match/Match.vue";
import ServerCustomRoom from "#/sys/server-custom-room/ServerCustomRoom.vue";
import ChannelList from "#/sys/channel-list/ChannelList.vue";


const chatStore = useChatStore();
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
				<template
					v-else-if="room.type === 'channel-list-custom-room'"
					:key="room.type + '|' + room.name"
				>
					<KeepAlive :key="room.type + '|' + room.name">
						<ChannelList
							v-if="room.isActive() && !room.isClosed()"
							:room="(room as ChannelListCustomRoom)"
							class="[ flex:full ]"
							@join-channel="joinChannelHandler"
						/>
					</KeepAlive>
				</template>
			</template>
		</div>

		<Match :maybe="chatStore.store.clientError">
			<template #some="{ data: error }">
				<Teleport :to="`#${error.id}_teleport`">
					<Alert type="error" :can-close="false">
						<h1>Erreur</h1>
						<p>{{ error.data }}</p>
					</Alert>
				</Teleport>
			</template>
		</Match>
	</main>
</template>

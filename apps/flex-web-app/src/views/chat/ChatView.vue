<script setup lang="ts">
import type { ChannelRoom } from "~/channel/ChannelRoom";
import type { PrivateRoom } from "~/private/PrivateRoom";
import type { ServerCustomRoom } from "~/custom-room/ServerCustomRoom";
import type { ChannelListCustomRoom } from "~/custom-room/ChannelListCustomRoom";

import { Alert } from "@phisyx/flex-uikit";

import { useChatStore } from "~/store/ChatStore";

import Navigation from "~/components/navigation/Navigation.vue";
import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";
import ServerCustomRoomComponent from "~/components/custom-room/ServerCustomRoom.vue";
import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";
import ChannelCreateDialog from "~/components/dialog/ChannelCreateDialog.vue";
import ChannelList from "#/sys/channel-list/ChannelList.vue";
import Match from "#/sys/match/Match.vue";

import { rooms } from "./ChatView.state";
import {
	joinChannelHandler,
	requestCreateChannelHandler,
} from "./ChatView.handlers";
import ChangeNickDialog from "~/components/dialog/ChangeNickDialog.vue";

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
						<ServerCustomRoomComponent
							:room="(room as ServerCustomRoom)"
							class="[ flex:full ]"
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
							@channel-create-request="
								requestCreateChannelHandler
							"
						/>
					</KeepAlive>
				</template>
			</template>
		</div>

		<!-- Teleport -->

		<Match :maybe="chatStore.store.clientError">
			<template #some="{ data: error }">
				<Teleport :to="`#${error.id}_teleport`">
					<Alert type="error" :can-close="false">
						<h1 class="[ align-t:left ]">
							<IconError class="[ size=4 align-v:top ]" />
							Erreur
						</h1>

						<p>{{ error.data }}</p>
					</Alert>
				</Teleport>
			</template>
		</Match>

		<ChannelCreateDialog />
		<ChangeNickDialog />
	</main>
</template>

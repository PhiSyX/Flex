<script setup lang="ts">
import { computed } from "vue";

import type {
	ChannelListCustomRoom,
	ChannelRoom,
	NoticeCustomRoom,
	PrivateRoom,
	ServerCustomRoom,
} from "@phisyx/flex-chat";
import { ChannelJoinDialog } from "~/dialogs/room";
import { useChatStore } from "~/store";
import { useOverlayerStore } from "~/store";

import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";
import ServerCustomRoomComponent from "~/components/custom_room/ServerCustomRoom.vue";
import ChangeNickDialog from "~/components/dialog/ChangeNickDialog.vue";
import ChannelCreateDialog from "~/components/dialog/ChannelCreateDialog.vue";
import ChannelSettingsDialog from "~/components/dialog/ChannelSettingsDialog.vue";
import ClientError from "~/components/error/ClientError.vue";
import Navigation from "~/components/navigation/Navigation.vue";
import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";
import ChannelList from "#/sys/channel_list/ChannelList.vue";
import CustomRoomNotice from "#/sys/custom_room_notice/CustomRoomNotice.vue";

import { View } from "../index";

// --------- //
// Composant //
// --------- //

const chatStore = useChatStore();
const overlayerStore = useOverlayerStore();

const changeView = defineModel<View>("changeView");

const rooms = computed(() => chatStore.store.roomManager().rooms());

function joinChannel(name: ChannelID) {
	chatStore.joinChannel(name);
	chatStore.changeRoom(name);
}

function closeRoom(name: RoomID) {
	chatStore.closeRoom(name);
}

function openJoinChannelDialog(event: Event) {
	ChannelJoinDialog.create(overlayerStore.store, { event });
}

function openSettingsView() {
	changeView.value = View.Settings;
}
</script>

<template>
	<main id="chat-view" class="[ flex h:full ]">
		<Navigation @open-settings-view="openSettingsView" />

		<div class="room [ flex:full flex ]">
			<template v-for="room in rooms" :key="room.id">
				<template
					v-if="room.type === 'server-custom-room'"
					:key="room.type + '@a' + room.name"
				>
					<KeepAlive :key="room.type + '@a' + room.name">
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
					:key="room.type + '@b' + room.name"
				>
					<KeepAlive :key="room.type + '@b' + room.name">
						<ChannelList
							v-if="room.isActive() && !room.isClosed()"
							:room="(room as ChannelListCustomRoom)"
							class="[ flex:full ]"
							@join-channel="joinChannel"
							@create-channel-dialog="openJoinChannelDialog"
						/>
					</KeepAlive>
				</template>
				<template
					v-else-if="room.type === 'notice-custom-room'"
					:key="room.type + '@c' + room.name"
				>
					<KeepAlive :key="room.type + '@c' + room.name">
						<CustomRoomNotice
							v-if="room.isActive() && !room.isClosed()"
							:room="(room as NoticeCustomRoom)"
							class="[ flex:full ]"
							@close="() => closeRoom(room.id())"
						/>
					</KeepAlive>
				</template>
			</template>
		</div>

		<!-- Teleport -->

		<ClientError />
		<ChannelCreateDialog />
		<ChannelSettingsDialog />
		<ChangeNickDialog />
	</main>
</template>

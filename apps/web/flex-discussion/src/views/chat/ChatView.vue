<script setup lang="ts">
import type {
	ChannelListCustomRoom,
	ChannelRoom,
	NoticeCustomRoom,
	PrivateRoom,
	ServerCustomRoom,
} from "@phisyx/flex-chat";

import { computed } from "vue";

import { ChannelJoinDialog, View } from "@phisyx/flex-chat";

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
import ChannelList from "#/sys/channel_list/ChannelList.template.vue";
import CustomRoomNotice from "#/sys/custom_room_notice/CustomRoomNotice.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = useChatStore();
let overlayer_store = useOverlayerStore();

let change_view = defineModel<View>("changeView");
let rooms = computed(() => chat_store.store.roomManager().rooms());

// ------- //
// Handler //
// ------- //

function join_channel_handler(name: ChannelID) 
{
	chat_store.joinChannel(name);
	chat_store.changeRoom(name);
}

function close_room_handler(name: RoomID) 
{
	chat_store.closeRoom(name);
}

function open_join_channel_dialog_handler(event: Event) 
{
	ChannelJoinDialog.create(overlayer_store.store, { event });
}

function open_settings_view_handler() 
{
	change_view.value = View.Settings;
}
</script>

<template>
	<main id="chat-view" class="[ flex h:full ]">
		<Navigation @open-settings-view="open_settings_view_handler" />

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
							@join-channel="join_channel_handler"
							@create-channel-dialog="open_join_channel_dialog_handler"
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
							@close="() => close_room_handler(room.id())"
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

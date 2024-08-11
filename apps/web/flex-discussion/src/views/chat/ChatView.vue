<script setup lang="ts">
import { computed, shallowRef as shallow_ref } from "vue";

import {
	ChannelJoinDialog,
	ChannelListCustomRoom,
	ChannelRoom,
	MentionsCustomRoom,
	NoticesCustomRoom,
	PrivateRoom,
	ServerCustomRoom,
	View
} from "@phisyx/flex-chat";
import { AudioSound } from "@phisyx/flex-vue-uikit";

import { use_chat_store, use_overlayer_store } from "~/store";

import ClientError from "~/components/error/ClientError.vue";
import Navigation from "~/components/navigation/Navigation.vue";

import ChangeFormatsColorsDialog from "~/components/dialog/ChangeFormatsColorsDialog.vue";
import ChangeNickDialog from "~/components/dialog/ChangeNickDialog.vue";
import ChannelCreateDialog from "~/components/dialog/ChannelCreateDialog.vue";
import ChannelSettingsDialog from "~/components/dialog/ChannelSettingsDialog.vue";

import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";
import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";

import ServerCustomRoomComponent from "~/components/custom_room/ServerCustomRoom.vue";
import ChannelListCustomRoomComponent from "#/sys/custom_room_channel_list/CustomRoomChannelList.template.vue";
import MentionsCustomRoomComponent from "#/sys/custom_room_mentions/CustomRoomMentions.template.vue";
import NoticesCustomRoomComponent from "#/sys/custom_room_notices/CustomRoomNotices.template.vue";

import connection_audio from "#/assets/audio/connection.mp3";
import invite_audio from "#/assets/audio/invite.mp3";
import mention_audio from "#/assets/audio/mention.mp3";
import notice_audio from "#/assets/audio/notice.mp3";
import query_audio from "#/assets/audio/query.wav";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

let change_view = defineModel<View>("changeView");
let rooms = computed(() => chat_store.store.room_manager().rooms());

const custom_rooms_components = shallow_ref({
	[ChannelListCustomRoom.ID]: ChannelListCustomRoomComponent,
	[NoticesCustomRoom.ID]: NoticesCustomRoomComponent,
	[ServerCustomRoom.ID]: ServerCustomRoomComponent,
	[MentionsCustomRoom.ID]: MentionsCustomRoomComponent,
} as const);

const rooms_components = shallow_ref({
	[ChannelRoom.type]: ChannelRoomComponent,
	[PrivateRoom.type]: PrivateRoomComponent,
} as const);

let audio_src = computed({
	get() {
		return chat_store.store.audio_src;
	},
	set($1) {
		chat_store.store.audio_src = $1;
	}
});

// ------- //
// Handler //
// ------- //

function join_channel_handler(name: ChannelID)
{
	chat_store.join_channel(name);
	chat_store.change_room(name);
}

function close_room_handler(name: RoomID)
{
	chat_store.close_room(name);
}

function open_join_channel_dialog_handler(event: Event)
{
	ChannelJoinDialog.create(overlayer_store.store, { event });
}

function open_settings_view_handler()
{
	change_view.value = View.Settings;
}

function reset_audio_src()
{
	audio_src.value = null;
}
</script>

<template>
	<main id="chat-view" class="[ flex h:full ]">
		<Navigation @open-settings-view="open_settings_view_handler" />

		<div class="room [ flex:full flex ]">
			<template v-for="room in rooms" :key="room.id()">
				<template v-if="
					custom_rooms_components[room.id()] || 
					// @ts-expect-error à corriger
					rooms_components[room.type]
				">
					<KeepAlive :key="room.type + '/' + room.id()">
						<component
							v-show="room.is_active() && !room.is_closed()"
							:is="
								custom_rooms_components[room.id()] ||
								// @ts-expect-error à corriger
								rooms_components[room.type]
							" 
							:room="(room as any)"
							class="[ flex:full ]"
							@join-channel="join_channel_handler"
							@create-channel-dialog="open_join_channel_dialog_handler"
							@close="() => close_room_handler(room.id())"
						/>
					</KeepAlive>
				</template>
			</template>
		</div>

		<AudioSound :src="connection_audio" :autoplay="audio_src === 'connection'" @ended="reset_audio_src" />
		<AudioSound :src="invite_audio" :autoplay="audio_src === 'invite'" @ended="reset_audio_src" />
		<AudioSound :src="mention_audio" :autoplay="audio_src === 'mention'" @ended="reset_audio_src" />
		<AudioSound :src="notice_audio" :autoplay="audio_src === 'notice'" @ended="reset_audio_src" />
		<AudioSound :src="query_audio" :autoplay="audio_src === 'query'" @ended="reset_audio_src" />

		<!-- Teleport -->

		<ClientError />

		<ChangeFormatsColorsDialog />
		<ChangeNickDialog />
		<ChannelCreateDialog />
		<ChannelSettingsDialog />

	</main>
</template>

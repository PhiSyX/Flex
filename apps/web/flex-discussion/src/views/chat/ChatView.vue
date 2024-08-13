<script setup lang="ts">
import { computed, shallowRef as shallow_ref } from "vue";
import { useRouter as use_router } from "vue-router";

import {
	ChannelRoom,
	MentionsCustomRoom,
	NoticesCustomRoom,
	PrivateRoom,
	ServerCustomRoom,
	View,
} from "@phisyx/flex-chat";

import { use_chat_store } from "~/store";

import ChannelRoomComponent from "~/components/channel/ChannelRoom.vue";
import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";

import ServerCustomRoomComponent from "~/components/custom_room/ServerCustomRoom.vue";
import MentionsCustomRoomComponent from "#/sys/custom_room_mentions/CustomRoomMentions.template.vue";
import NoticesCustomRoomComponent from "#/sys/custom_room_notices/CustomRoomNotices.template.vue";

// --------- //
// Composant //
// --------- //

let router = use_router();
let chat_store = use_chat_store();

let rooms = computed(() => chat_store.store.room_manager().rooms());

const custom_rooms_components = shallow_ref({
	[NoticesCustomRoom.ID]: NoticesCustomRoomComponent,
	[ServerCustomRoom.ID]: ServerCustomRoomComponent,
	[MentionsCustomRoom.ID]: MentionsCustomRoomComponent,
} as const);

const rooms_components = shallow_ref({
	[ChannelRoom.type]: ChannelRoomComponent,
	[PrivateRoom.type]: PrivateRoomComponent,
} as const);

// ------- //
// Handler //
// ------- //

function join_channel_handler(name: ChannelID)
{
	chat_store.join_channel(name);
	chat_store.change_room(name);
	router.push({ name: View.Chat });
}

function close_room_handler(name: RoomID)
{
	chat_store.close_room(name);
}
</script>

<template>
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
						@close="() => close_room_handler(room.id())"
					/>
				</KeepAlive>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat";
import type { ChatView } from "@phisyx/flex-chat-ui";

import {
	MentionsCustomRoom,
	NoticesCustomRoom,
	ServerCustomRoom,
} from "@phisyx/flex-chat";
import { ChatWireframe } from "@phisyx/flex-chat-ui";
import { computed, reactive, shallowRef } from "vue";

import { use_chat_store } from "~/store";

import MentionsCustomRoomComponent from "#/sys/custom_room_mentions/CustomRoomMentions.template.vue";
import NoticesCustomRoomComponent from "#/sys/custom_room_notices/CustomRoomNotices.template.vue";
import ServerCustomRoomComponent from "~/components/custom_room_server/CustomRoomServer.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;

let view = reactive(
	ChatWireframe.create(
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
	),
) as ChatView;

let custom_rooms_components = shallowRef({
	[MentionsCustomRoom.ID]: MentionsCustomRoomComponent,
	[NoticesCustomRoom.ID]: NoticesCustomRoomComponent,
	[ServerCustomRoom.ID]: ServerCustomRoomComponent,
} as const);

let rooms = computed(() => view.rooms);
</script>

<template>
	<div class="room [ flex:full flex ]">
		<template v-for="room in rooms" :key="room.id()">
			<template v-if="custom_rooms_components[room.id()]">
				<KeepAlive :key="room.type + '/' + room.id()">
					<component
						v-show="room.is_active() && !room.is_closed()"
						:is="custom_rooms_components[room.id()]"
						:room="(room as any)"
						:data-room="room.name"
						class="[ flex:full ]"
						@join-channel="view.join_channel_handler"
						@close="() => view.close_room_handler(room.id())"
					/>
				</KeepAlive>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import {
	PrivatePendingRequestDialog,
	type PrivateRoom,
} from "@phisyx/flex-chat";

import {
	onActivated as on_activated,
	onDeactivated as on_deactivated,
	onMounted as on_mounted,
	shallowRef as shallow_ref,
} from "vue";
import { useRoute as use_route } from "vue-router";

import { None } from "@phisyx/flex-safety";

import { use_dialog } from "~/hooks/dialog";
import { use_chat_store } from "~/store";

import PrivateRoomComponent from "~/components/private/PrivateRoom.vue";
import Match from "#/sys/match/Match.vue";

// --------- //
// Composant //
// --------- //

let route = use_route();

let chat_store = use_chat_store();

let room = shallow_ref(None().as<PrivateRoom>());

let { create_dialog, close_dialog } = use_dialog(PrivatePendingRequestDialog);

// --------- //
// Lifecycle //
// --------- //

on_mounted(() => {
	let priv = chat_store.store.room_manager().get(route.params.id as UserID);
	room.value = priv.as<PrivateRoom>();
});

on_activated(() => {
	if (room.value.is_some()) {
		let priv = room.value.unwrap();
		let participant = priv.get_participant_unchecked(priv.id());

		if (priv.is_active() && priv.is_pending()) {
			create_dialog(participant);
		}
	}
});

on_deactivated(() => {
	if (room.value.is_some()) {
		close_dialog();
	}
});
</script>

<template>
	<Match :maybe="room">
		<template #some="{ data: room }">
			<PrivateRoomComponent :room="room" class="[ flex:full ]" />
		</template>
	</Match>
</template>

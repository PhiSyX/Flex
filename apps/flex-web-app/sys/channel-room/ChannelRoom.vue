<script setup lang="ts">
import { UiButton, ButtonIcon } from "@phisyx/flex-uikit";

import { ChannelUsers } from "~/channel/ChannelUsers";
import { RoomMessage } from "~/room/RoomMessage";

import { showUserlist } from "./ChannelRoom.state";
import { openPrivate, type Emits, sendMessage } from "./ChannelRoom.handler";

import ChannelUserlist from "#/sys/channel-userlist/ChannelUserlist.vue";
import Room from "#/sys/room/Room.vue";

// ---- //
// Type //
// ---- //

interface Props {
	messages: Array<RoomMessage>;
	name: string;
	users: ChannelUsers;
}

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const openPrivateHandler = openPrivate(emit);
const sendMessageHandler = sendMessage(emit, props.name);
</script>

<template>
	<div class="room/channel" :data-room="name">
		<Room
			:messages="messages"
			:name="name"
			@open-private="openPrivateHandler"
			@send-message="sendMessageHandler"
		>
			<template #topic>
				<p>Aucun sujet</p>
			</template>

			<template #topic-action>
				<UiButton
					v-model:selected="showUserlist"
					:true-value="true"
					:false-value="false"
					icon="users"
				/>

				<ButtonIcon class="close" icon="close" />
			</template>

			<template #room-info v-if="showUserlist">
				<aside class="room/info">
					<ChannelUserlist
						:name="name"
						:users="users"
						class="room/userlist"
					/>

					<slot name="userlist-menu" />
				</aside>
			</template>
		</Room>
	</div>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/channel") {
	display: flex;

	@include fx.class("room/topic") {
		p {
			display: flex;
			place-content: center;
			place-items: center;
			height: 100%;
			margin-block: 0;
			user-select: none;
		}
	}

	aside {
		order: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding-top: fx.space(2);
	}

	aside ~ div {
		form {
			padding-right: 0;
		}
	}

	@include fx.class("room/userlist") {
		flew-grow: 1;
		overflow: hidden;
	}
}

@include fx.class("room/info") {
	min-width: fx.space(280);
	width: fx.space(280);
	max-width: fx.space(280);
}
</style>

<script setup lang="ts">
import { Option } from "@phisyx/flex-safety";
import { Alert, ButtonIcon, UiButton } from "@phisyx/flex-uikit";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";
import { ChannelUsers } from "~/channel/ChannelUsers";
import { RoomMessage } from "~/room/RoomMessage";
import { ChannelNick } from "~/channel/ChannelNick";
import {
	ignoreUser,
	openPrivate,
	selectUser,
	sendMessage,
	type Emits,
	unignoreUser,
} from "./ChannelRoom.handler";
import { displayUserlist } from "./ChannelRoom.state";

import ChannelUserlistMenu from "#/sys/channel-userlist-menu/ChannelUserlistMenu.vue";
import ChannelUserlist from "#/sys/channel-userlist/ChannelUserlist.vue";
import Match from "#/sys/match/Match.vue";
import Room from "#/sys/room/Room.vue";

// ---- //
// Type //
// ---- //

interface Props {
	me: ChannelNick;
	messages: Array<RoomMessage>;
	name: string;
	selectedUser: Option<ChannelSelectedUser>;
	users: ChannelUsers;
}

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const ignoreUserHandler = ignoreUser(emit);
const openPrivateHandler = openPrivate(emit);
const selectUserHandler = selectUser(emit);
const sendMessageHandler = sendMessage(emit, props.name);
const unignoreUserHandler = unignoreUser(emit);
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
					v-model:selected="displayUserlist"
					:true-value="true"
					:false-value="false"
					icon="users"
				/>

				<ButtonIcon class="close" icon="close" />
			</template>

			<template #after-topic-before-main>
				<Alert type="warning">
					Ne communique <strong>jamais</strong> tes coordonnées
					personnelles (nom, adresse, n° de téléphone...), ni tes
					identifiants de connexion.
				</Alert>
			</template>

			<template #room-info v-if="displayUserlist">
				<aside class="room/info">
					<ChannelUserlist
						:name="name"
						:users="users"
						class="room/userlist"
						@open-private="openPrivateHandler"
						@select-user="selectUserHandler"
					/>

					<!-- <slot name="userlist-menu" /> -->
					<Match :maybe="selectedUser">
						<template #some="{ data: selectedUser }">
							<ChannelUserlistMenu
								:me="me"
								:user="selectedUser"
								@ignore-user="ignoreUserHandler"
								@open-private="openPrivateHandler"
								@unignore-user="unignoreUserHandler"
							/>
						</template>
					</Match>
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
		flex-grow: 1;
		overflow: hidden;
	}
}

@include fx.class("room/info") {
	min-width: fx.space(280);
	width: fx.space(280);
	max-width: fx.space(280);
}
</style>

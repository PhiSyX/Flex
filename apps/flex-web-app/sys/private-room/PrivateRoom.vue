<script setup lang="ts">
import Room from "#/sys/room/Room.vue";
import { Alert, ButtonIcon, UiButton } from "@phisyx/flex-uikit";

import {
	closeRoom,
	sendMessage,
	toggleIgnoreUser,
	type Emits,
	changeNickRequest,
} from "./PrivateRoom.handler";
import {
	type Props,
	computeIsMe,
	computeTitleIgnoreButton,
} from "./PrivateRoom.state";
import { computeCompletionList } from "~/components/private/PrivateRoom.state";

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const changeNickRequestHandler = changeNickRequest(emit);
const closeRoomHandler = closeRoom(emit);
const sendMessageHandler = sendMessage(emit, props.recipient.nickname);
const toggleIgnoreUserHandler = toggleIgnoreUser(emit, props);

const isMe = computeIsMe(props);
const titleIgnoreButton = computeTitleIgnoreButton(props);
const completionList = computeCompletionList(props.recipient);
</script>

<template>
	<div class="room/private [ flex ]" :data-room="recipient.nickname">
		<Room
			:completion-list="completionList"
			:disable-input="disableInput"
			:input-history="inputHistory"
			:messages="messages"
			:name="recipient.nickname"
			:nick="currentNick"
			@change-nick-request="changeNickRequestHandler"
			@send-message="sendMessageHandler"
		>
			<template #topic>
				<p class="[ flex flex/center:full h:full my=0 select:none ]">
					Discussion privée avec {{ recipient.nickname }}
				</p>
			</template>

			<template #topic-action>
				<UiButton
					v-if="!isMe"
					icon="user-block"
					:selected="disableInput"
					:false-value="false"
					:true-value="true"
					:title="titleIgnoreButton"
					@click="toggleIgnoreUserHandler()"
				/>
				<ButtonIcon
					icon="close"
					@click="closeRoomHandler(recipient.intoUser())"
				/>
			</template>

			<template #after-topic-before-main>
				<Alert type="warning" :close-after-seconds="15">
					Ne communique <strong>jamais</strong> tes coordonnées
					personnelles (nom, adresse, n° de téléphone...), ni tes
					identifiants de connexion.
				</Alert>
			</template>
		</Room>
	</div>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/private") {
	@include fx.class("room/editbox") {
		background-color: var(--body-bg);
	}
}
</style>

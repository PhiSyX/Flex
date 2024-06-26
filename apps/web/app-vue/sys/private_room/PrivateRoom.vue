<script setup lang="ts">
import { Alert, ButtonIcon, UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import type { PrivateParticipant } from "~/private/participant";
import type { PrivateRoom } from "~/private/room";

import Room from "#/sys/room/Room.vue";

// ---- //
// Type //
// ---- //

interface Props {
	completionList?: Array<string>;
	currentClientUser: PrivateParticipant;
	currentNickname: string;
	isRecipientBlocked: boolean;
	recipient: PrivateParticipant;
	room: PrivateRoom;
}

interface Emits {
	(evtName: "change-nickname", event: MouseEvent): void;
	(evtName: "close"): void;
	(evtName: "open-room", roomName: RoomID): void;
	(evtName: "send-message", message: string): void;
	(evtName: "ignore-user", nickname: string): void;
	(evtName: "unignore-user", nickname: string): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Est-ce que le client courant est le participant lui-même?
const isCurrentClientParticipantHimself = computed(() =>
	props.currentClientUser.partialEq(props.recipient),
);

const titleIgnoreBtn = computed(() => {
	return props.isRecipientBlocked
		? `Ne plus ignorer ${props.recipient.nickname}`
		: `Ignorer ${props.recipient.nickname}`;
});

const changeNickname = (event: MouseEvent) => emit("change-nickname", event);
const openRoom = (roomName: RoomID) => emit("open-room", roomName);
const sendMessage = (message: string) => emit("send-message", message);

function toggleIgnoreUserHandler() {
	if (props.isRecipientBlocked) {
		emit("unignore-user", props.recipient.nickname);
	} else {
		emit("ignore-user", props.recipient.nickname);
	}
}
</script>

<template>
	<div class="room/private [ flex ]" :data-room="recipient.nickname">
		<Room
			:completion-list="completionList"
			:disable-input="isRecipientBlocked"
			:current-client-nickname="currentNickname"
			:room="room"
			@open-room="openRoom"
			@change-nickname="changeNickname"
			@send-message="sendMessage"
		>
			<template #topic>
				<p class="[ flex flex/center:full h:full my=0 select:none ]">
					Discussion privée avec {{ recipient.nickname }}
				</p>
			</template>

			<template #topic-action>
				<UiButton
					v-if="!isCurrentClientParticipantHimself"
					icon="user-block"
					:selected="isRecipientBlocked"
					:false-value="false"
					:true-value="true"
					:title="titleIgnoreBtn"
					@click="toggleIgnoreUserHandler"
				/>
				<ButtonIcon
					icon="close"
					title="Fermer la chambre active"
					@click="emit('close')"
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
	@include fx.class("room/main") {
		> div {
			border-radius: 0;
			border-bottom-left-radius: 4px;
		}
	}

	@include fx.class("room/editbox") {
		background-color: var(--body-bg);
	}
}
</style>

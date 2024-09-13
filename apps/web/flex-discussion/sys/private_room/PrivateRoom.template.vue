<script setup lang="ts">
import type { PrivateParticipant, PrivateRoom } from "@phisyx/flex-chat";

import { computed } from "vue";

import { Alert, ButtonIcon, UiButton, UiImage } from "@phisyx/flex-vue-uikit";

import Room from "#/sys/room/Room.template.vue";

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
	textFormatBold?: boolean | null;
	textFormatItalic?: boolean | null;
	textFormatUnderline?: boolean | null;
	textColorBackground?: number | null;
	textColorForeground?: number | null;
}

interface Emits {
	(event_name: "change-nickname", event: MouseEvent): void;
	(event_name: "close"): void;
	(event_name: "ignore-user", origin: Origin): void;
	(event_name: "open-colors-box", event: MouseEvent): void;
	(event_name: "open-room", room_id: RoomID): void;
	(event_name: "send-message", message: string): void;
	(event_name: "unignore-user", origin: Origin): void;
}

interface Slots {
	avatar: (_: { recipient: PrivateParticipant }) => unknown;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

// Est-ce que le client courant est le participant lui-même?
let is_current_client_participant_himself = computed(() =>
	props.currentClientUser.partial_eq(props.recipient),
);

let ignore_btn_title_attribute = computed(() =>
	props.isRecipientBlocked
		? `Ne plus ignorer ${props.recipient.nickname}`
		: `Ignorer ${props.recipient.nickname}`,
);

// ------- //
// Handler //
// ------- //

const change_nickname_handler = (event: MouseEvent) =>
	emit("change-nickname", event);
const open_colors_box_handler = (event: MouseEvent) =>
	emit("open-colors-box", event);
const open_room_handler = (room_id: RoomID) => emit("open-room", room_id);
const send_message_handler = (message: string) => emit("send-message", message);

function toggle_ignore_user_handler() {
	if (props.isRecipientBlocked) {
		emit("unignore-user", props.recipient);
	} else {
		emit("ignore-user", props.recipient);
	}
}
</script>

<template>
	<div :data-room="recipient.nickname" class="room/private [ flex ]">
		<Room
			:blurred-messages="room.is_pending()"
			:completion-list="completionList"
			:disable-input="room.is_readonly() || isRecipientBlocked"
			:current-client-nickname="currentNickname"
			:room="room"
			:text-format-bold="textFormatBold"
			:text-format-italic="textFormatItalic"
			:text-format-underline="textFormatUnderline"
			:text-color-background="textColorBackground"
			:text-color-foreground="textColorForeground"
			@open-colors-box="open_colors_box_handler"
			@open-room="open_room_handler"
			@change-nickname="change_nickname_handler"
			@send-message="send_message_handler"
		>
			<template #topic>
				<p class="[ flex flex/center:full h:full my=0 select:none ]">
					Discussion privée avec {{ recipient.nickname }}
				</p>
			</template>

			<template #topic-action>
				<slot name="avatar" :recipient="recipient">
					<UiImage
						src="/img/default-avatar.png"
						:title="`Avatar du compte de ${recipient.nickname}.`"
					/>
				</slot>

				<UiButton
					v-if="!is_current_client_participant_himself"
					icon="user-block"
					:selected="isRecipientBlocked"
					:false-value="false"
					:true-value="true"
					:title="ignore_btn_title_attribute"
					@click="toggle_ignore_user_handler"
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

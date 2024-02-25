<script setup lang="ts">
import { computed } from "vue";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelRoom } from "~/channel/ChannelRoom";
import { ChannelSettingsDialog } from "~/channel/ChannelSettings";
import { ChannelTopicLayer } from "~/channel/ChannelTopic";
import { UserChangeNicknameDialog } from "~/user/User";

import { useChatStore } from "~/store/ChatStore";
import { useOverlayerStore } from "~/store/OverlayerStore";

import ChannelRoomComponent from "#/sys/channel-room/ChannelRoom.vue";
import ChannelRoomKicked from "#/sys/channel-room-kicked/ChannelRoomKicked.vue";
import { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";

interface Props {
	// Le salon actif.
	room: ChannelRoom;
}

// --------- //
// Composant //
// --------- //

const chatStore = useChatStore();
const overlayerStore = useOverlayerStore();

const props = defineProps<Props>();

// Le client courant.
const currentClient = computed(() => chatStore.store.me());

// Le pseudo du client courant.
const currentClientNickname = computed(() => currentClient.value.nickname);

// Le client courant, qui est membre du salon.
//
// NOTE: l'utilisateur courant PEUT être sanctionné à tout moment, c'est
//       pourquoi l'on évitera de .unwrap() le retour de la fonction `getUser`.
const currentClientMember = computed(() =>
	props.room.getMember(currentClient.value.id)
);

// Membre du salon actuellement sélectionné par le client courant.
const selectedMember = computed(() =>
	chatStore.getCurrentSelectedChannelMember(props.room)
);

// Liste de la complétion pour la boite de saisie, il y contient:
//
// 1. Les salons (TODO).
// 2. Les membres du salon.
// 3. Toutes les commandes.
const completionList = computed(() => [
	props.room.name,
	...props.room.members.all.map((user) => user.nickname),
	...chatStore.allCommands(),
]);

// -------- //
// Handlers //
// -------- //

/**
 * Ferme le salon actif.
 */
function closeChannel() {
	chatStore.closeRoom(props.room.name);
}

/**
 * Crée le layer du sujet.
 */
function createTopicLayer(payload: {
	event: Event;
	linkedElement: HTMLInputElement | undefined;
	mode: boolean;
}) {
	if (payload.mode) {
		// @ts-expect-error ?
		ChannelTopicLayer.create(overlayerStore.store, payload);
	} else {
		// @ts-expect-error ?
		ChannelTopicLayer.destroy(overlayerStore.store);
	}
}

/**
 * Envoie les commandes liées aux niveaux d'accès.
 */
const sendAccessLevel =
	(applyState: "+" | "-") =>
	(member: ChannelMember, accessLevel: ChannelAccessLevel) => {
		if (applyState === "+") {
			chatStore.sendSetAccessLevel(props.room, member, accessLevel);
		} else {
			chatStore.sendUnsetAccessLevel(props.room, member, accessLevel);
		}
	};

/**
 * Envoie de la commande /SILENCE.
 */
const sendSilenceUserCommand = (applyState: "+" | "-") => (origin: Origin) => {
	if (applyState === "+") {
		chatStore.ignoreUser(origin.nickname);
	} else {
		chatStore.unignoreUser(origin.nickname);
	}
};

/**
 * Ouvre la boite de dialogue de changement de pseudonyme.
 */
function openChangeNicknameDialog(event: MouseEvent) {
	// @ts-expect-error ?
	UserChangeNicknameDialog.create(overlayerStore.store, { event });
}

/**
 * Ouvre la boite de dialogue du centre de contrôle du salon actif.
 */
function openChannelSettingsDialog(_: Event) {
	// @ts-expect-error ?
	ChannelSettingsDialog.create(overlayerStore.store, {
		room: props.room,
		currentClientChannelMember: currentClientMember.value.unwrap(),
	});
}

/**
 * Ouvre une chambre.
 */
function openRoom(roomName: RoomID) {
	chatStore.openRoom(roomName);
}

/**
 * Ouvre une chambre privé d'un utilisateur.
 */
function openPrivate(origin: Origin) {
	chatStore.openPrivateOrCreate(origin);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction BAN à un autre membre du salon.
 */
function sendBanMemberCommand(member: ChannelMember) {
	chatStore.banChannelMemberMask(
		props.room,
		member.address("*!ident@hostname")
	);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction BAN à un autre membre du salon.
 */
function sendBanMemberNickCommand(member: ChannelMember) {
	chatStore.banChannelMemberMask(props.room, member.address("nick!*@*"));
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction KICK à un autre membre du salon.
 */
function sendKickMemberCommand(member: ChannelMember) {
	chatStore.kickChannelMember(props.room, member);
}

/**
 * Envoie de la commande /JOIN.
 */
function sendJoinChannelCommand() {
	chatStore.joinChannel(props.room.name);
}

/**
 * Envoie du message au salon actif.
 */
function sendMessage(message: string) {
	chatStore.sendMessage(props.room.name, message);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction UNBAN à un autre membre du salon.
 */
function sendUnbanMemberCommand(member: ChannelMemberSelected) {
	const mask = member.banned.expect("Banmask du membre")[0];
	chatStore.unbanChannelMemberMask(props.room, mask);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction UNBAN à un autre membre du salon.
 */
function sendUnbanMemberNickCommand(member: ChannelMemberSelected) {
	const mask = member.banned.expect("Banmask du membre")[0];
	chatStore.unbanChannelMemberMask(props.room, mask);
}

/**
 * Envoie la commande de mise à jour du salon.
 */
function sendUpdateTopic(topic: string) {
	chatStore.updateTopic(props.room.name, topic);
}

/**
 * (Dé-)Sélectionne un membre du salon.
 */
function toggleSelectChannelMember(origin: Origin) {
	chatStore.toggleSelectChannelMember(props.room, origin);
}
</script>

<template>
	<ChannelRoomComponent
		:completion-list="completionList"
		:current-nickname="currentClientNickname"
		:current-client-member="currentClientMember"
		:room="room"
		:selected-member="selectedMember"
		@ban-member="sendBanMemberCommand"
		@ban-nick="sendBanMemberNickCommand"
		@change-nickname="openChangeNicknameDialog"
		@create-topic-layer="createTopicLayer"
		@close="closeChannel"
		@ignore-user="(o) => sendSilenceUserCommand('+')(o)"
		@kick-member="sendKickMemberCommand"
		@open-channel-settings="openChannelSettingsDialog"
		@open-room="openRoom"
		@open-private="openPrivate"
		@select-member="toggleSelectChannelMember"
		@send-message="sendMessage"
		@set-access-level="(m, a) => sendAccessLevel('+')(m, a)"
		@unban-member="sendUnbanMemberCommand"
		@unban-nick="sendUnbanMemberNickCommand"
		@unignore-user="(o) => sendSilenceUserCommand('-')(o)"
		@unset-access-level="(m, a) => sendAccessLevel('-')(m, a)"
		@update-topic="sendUpdateTopic"
	>
		<template v-if="room.kicked" #history>
			<ChannelRoomKicked
				:last-message="room.lastMessage.unwrap()"
				@join-channel="sendJoinChannelCommand"
			/>
		</template>
	</ChannelRoomComponent>
</template>

<script setup lang="ts">
import type { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import type { ChannelActivitiesView } from "@phisyx/flex-chat/channel/activity";
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelMemberSelected } from "@phisyx/flex-chat/channel/member/selected";
import type { ChannelRoom } from "@phisyx/flex-chat/channel/room";
import type { Option } from "@phisyx/flex-safety";

import { computed, ref } from "vue";

import ActionBar from "@phisyx/flex-uikit-vue/actionbar/ActionBar.vue";
import Alert from "@phisyx/flex-uikit-vue/alert/Alert.vue";
import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import { TextEditable } from "@phisyx/flex-vue-uikit";

import ChannelActivities from "#/sys/channel_activities/ChannelActivities.template.vue";
import ChannelUserlist from "#/sys/channel_userlist/ChannelUserlist.template.vue";
import Match from "#/sys/match/Match.vue";
import MenuChannelUserlist from "#/sys/menu_channel_userlist/MenuChannelUserlist.template.vue";
import Room from "#/sys/room/Room.template.vue";

// ---- //
// Type //
// ---- //

export interface Props {
	activities?: ChannelActivitiesView;
	completionList?: Array<string>;
	currentClientMember: Option<ChannelMember>;
	currentNickname: string;
	room: ChannelRoom;
	selectedMember: Option<ChannelMemberSelected>;
	textFormatBold?: boolean | null;
	textFormatItalic?: boolean | null;
	textFormatUnderline?: boolean | null;
	textColorBackground?: number | null;
	textColorForeground?: number | null;
	userlistDisplayedByDefault: boolean;
	useIconInsteadOfAvatar?: boolean;
}

export interface Emits {
	(event_name: "ban-member", member: ChannelMember): void;
	(event_name: "ban-nick", member: ChannelMember): void;
	(event_name: "change-nickname", event: MouseEvent): void;
	(event_name: "close"): void;
	(
		event_name: "create-topic-layer",
		payload: {
			event: Event;
			linked_element: HTMLInputElement | undefined;
			mode: boolean;
		}
	): void;
	(event_name: "ignore-user", origin: Origin): void;
	(event_name: "kick-member", member: ChannelMember): void;
	(event_name: "open-channel-settings", event: Event): void;
	(event_name: "open-menu-channel-options", event: MouseEvent): void;
	(event_name: "open-colors-box", event: MouseEvent): void;
	(event_name: "open-private", origin: Origin): void;
	(event_name: "open-room", room_id: RoomID): void;
	(event_name: "select-member", origin: Origin): void;
	(event_name: "send-message", message: string): void;
	(
		event_name: "set-access-level",
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag
	): void;
	(event_name: "unban-member", member: ChannelMemberSelected): void;
	(event_name: "unban-nick", member: ChannelMemberSelected): void;
	(event_name: "unignore-user", origin: Origin): void;
	(
		event_name: "unset-access-level",
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag
	): void;
	(event_name: "update-topic", topic: string): void;
}

interface Slots {
	history: unknown;
	"userlist-additional-info": (_: { member: ChannelMember }) => unknown;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

let topic_input = ref(props.room.topic.get());
// Est-ce que le client courant peut éditer le sujet.
let current_client_member_can_edit_topic = computed(() =>
	props.currentClientMember
		.map((member) => props.room.can_edit_topic(member))
		.unwrap_or(false)
);

let display_userlist = ref(props.userlistDisplayedByDefault);

// La boite de saisie est désactivé quand le membre du salon actuellement
// connecté au client est sanctionné d'un KICK.
let is_disabled_input = computed(() => props.room.kicked);

// Attribut title: afficher/cacher liste des pseudo
let toggle_nicklist_title_attribute = computed(() => {
	let state = display_userlist.value ? "Cacher" : "Afficher";
	return `${state} la liste des membres`;
});

// Étendre la page d'activité pour afficher toutes les activités liées au salon.
let expand_activities = ref(false);

let room_topic_placeholder = computed(() => {
	if (!current_client_member_can_edit_topic.value) {
		return "Aucun sujet";
	}
	return "Appuie deux fois sur cette section pour mettre à jour le sujet";
});

// -------- //
// Handlers //
// -------- //

const ban_member_handler = (member: ChannelMember) =>
	emit("ban-member", member);
const ban_nick_handler = (member: ChannelMember) => emit("ban-nick", member);
const unban_member_handler = (member: ChannelMemberSelected) =>
	emit("unban-member", member);
const unban_nick_handler = (member: ChannelMemberSelected) =>
	emit("unban-nick", member);
const change_nickname_handler = (event: MouseEvent) =>
	emit("change-nickname", event);
const open_room_handler = (room_id: RoomID) => emit("open-room", room_id);
const close_room_handler = () => emit("close");
const ignore_user_handler = (origin: Origin) => emit("ignore-user", origin);
const kick_member_handler = (member: ChannelMember) =>
	emit("kick-member", member);
const unignore_user_handler = (origin: Origin) => emit("unignore-user", origin);
const open_channel_settings_handler = (event: Event) =>
	emit("open-channel-settings", event);
const open_menu_channel_options_handler = (event: MouseEvent) =>
	emit("open-menu-channel-options", event);
const open_colors_box_handler = (event: MouseEvent) =>
	emit("open-colors-box", event);
const open_private_handler = (origin: Origin) => emit("open-private", origin);
const select_channel_member_handler = (origin: Origin) =>
	emit("select-member", origin);
const send_message_handler = (message: string) => emit("send-message", message);
const set_access_level_handler = (
	member: ChannelMember,
	flag: ChannelAccessLevelFlag
) => emit("set-access-level", member, flag);
const unset_access_level_handler = (
	member: ChannelMember,
	flag: ChannelAccessLevelFlag
) => emit("unset-access-level", member, flag);

const submit_topic_handler = () => {
	emit("update-topic", topic_input.value);
};
const enable_topic_edit_mode_handler = (payload: {
	event: Event;
	linked_element: HTMLInputElement | undefined;
	mode: boolean;
}) => {
	emit("create-topic-layer", payload);
};
</script>

<template>
	<div class="room/channel [ flex ]" :data-room="room.name">
		<Room
			:completion-list="completionList"
			:current-client-nickname="currentNickname"
			:disable-input="is_disabled_input"
			:room="room"
			:text-format-bold="textFormatBold"
			:text-format-italic="textFormatItalic"
			:text-format-underline="textFormatUnderline"
			:text-color-background="textColorBackground"
			:text-color-foreground="textColorForeground"
			@change-nickname="change_nickname_handler"
			@open-colors-box="open_colors_box_handler"
			@open-private="open_private_handler"
			@open-room="open_room_handler"
			@send-message="send_message_handler"
			@dblclick-main="open_channel_settings_handler"
		>
			<template #before-main>
				<ActionBar class="room/topic">
					<TextEditable
						v-model="topic_input"
						:content="room.topic.get()"
						:locked="!current_client_member_can_edit_topic"
						:with-layer="true"
						:placeholder="room_topic_placeholder"
						@layer="enable_topic_edit_mode_handler"
						@submit="submit_topic_handler"
					/>

					<template #actions>
						<Button
							icon="ellipsis"
							title="Ouvrir le menu d'options du salon..."
							@click="open_menu_channel_options_handler"
						/>

						<Button
							v-model:selected="display_userlist"
							:true-value="true"
							:false-value="false"
							icon="users"
							:title="toggle_nicklist_title_attribute"
						/>

						<Button
							class="close"
							icon="close"
							title="Fermer la chambre active"
							@click="close_room_handler"
						/>
					</template>
				</ActionBar>

				<Alert
					:close-after-seconds="15"
					type="warning"
					content-align="center"
				>
					Ne communique <strong>jamais</strong> tes coordonnées
					personnelles (nom, adresse, n° de téléphone...), ni tes
					identifiants de connexion.
				</Alert>

				<ChannelActivities
					v-if="activities?.groups.length"
					v-model:expanded="expand_activities"
					:activities="activities"
					:current-client-member="currentClientMember"
					:room="room"
				/>
			</template>

			<template #history>
				<slot name="history" />
			</template>

			<template #room-info v-if="display_userlist">
				<aside
					class="room/info [ flex! h:full pt=2 min-w=36 w=36 max-w=36 ]"
				>
					<ChannelUserlist
						:name="room.name"
						:members="room.members"
						:use-icon-instead-of-avatar="useIconInsteadOfAvatar"
						class="room/userlist [ flex:full ov:h ]"
						@open-private="open_private_handler"
						@select-member="select_channel_member_handler"
					>
						<template #user-info="{ member }">
							<slot
								name="userlist-additional-info"
								:member="member"
							/>
						</template>
					</ChannelUserlist>

					<!-- <slot name="userlist-menu" /> -->
					<Match :maybe="currentClientMember.zip(selectedMember)">
						<template #some="{ data: [ccm, sm] }">
							<MenuChannelUserlist
								:current-client-member="ccm"
								:selected-member="sm"
								@ban-member="ban_member_handler"
								@ban-nick="ban_nick_handler"
								@ignore-user="ignore_user_handler"
								@kick-member="kick_member_handler"
								@open-private="open_private_handler"
								@set-access-level="set_access_level_handler"
								@unignore-user="unignore_user_handler"
								@unset-access-level="unset_access_level_handler"
								@unban-member="unban_member_handler"
								@unban-nick="unban_nick_handler"
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
	@include fx.class("room/topic") {
		p {
			color: var(--room-topic-placeholder-color);
		}
	}

	aside {
		order: var(--room-info-position, 1);
		~ div form {
			padding-right: 0;
		}
	}

	@include fx.class("room/channel:activities") {
		&.is-expanded ~ .room\/main {
			display: none;
		}
	}
}
</style>

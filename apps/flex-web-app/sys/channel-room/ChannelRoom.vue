<script setup lang="ts">
import { Alert, ButtonIcon, UiButton } from "@phisyx/flex-uikit";
import { Option } from "@phisyx/flex-safety";
import { computed, ref } from "vue";

import { ChannelRoom } from "~/channel/ChannelRoom";
import { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";

import { useChannelTopic } from "./ChannelRoom.hooks";

import ChannelUserlistMenu from "#/sys/channel-userlist-menu/ChannelUserlistMenu.vue";
import ChannelUserlist from "#/sys/channel-userlist/ChannelUserlist.vue";
import Match from "#/sys/match/Match.vue";
import Room from "#/sys/room/Room.vue";

// ---- //
// Type //
// ---- //

export interface Props {
	completionList?: Array<string>;
	currentNickname: string;
	currentClientMember: Option<ChannelMember>;
	room: ChannelRoom;
	selectedMember: Option<ChannelMemberSelected>;
}

export interface Emits {
	(evtName: "change-nickname", event: MouseEvent): void;
	(evtName: "close"): void;
	(evtName: "ignore-user", origin: Origin): void;
	(evtName: "kick-member", member: ChannelMember): void;
	(evtName: "open-channel-settings", event: Event): void;
	(evtName: "open-private", origin: Origin): void;
	(evtName: "select-member", origin: Origin): void;
	(evtName: "send-message", message: string): void;
	(
		evtName: "set-access-level",
		member: ChannelMember,
		accessLevel: ChannelAccessLevel
	): void;
	(
		evtName: "create-topic-layer",
		payload: {
			event: Event;
			linkedElement: HTMLInputElement | undefined;
			mode: boolean;
		}
	): void;
	(evtName: "unignore-user", origin: Origin): void;
	(
		evtName: "unset-access-level",
		member: ChannelMember,
		accessLevel: ChannelAccessLevel
	): void;
	(evtName: "update-topic", topic: string): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const {
	$topic,
	currentClientMemberCanEditTopic,
	enableTopicEditModeHandler,
	submitTopicHandler,
	topicEditMode,
	topicInput,
} = useChannelTopic(props, emit);

const displayUserlist = ref(true);

// La boite de saisie est désactivé quand le membre du salon actuellement
// connecté au client est sanctionné d'un KICK.
const isDisabledInput = computed(() => props.room.kicked);

// -------- //
// Handlers //
// -------- //

const changeNickname = (event: MouseEvent) => emit("change-nickname", event);
const closeRoom = () => emit("close");
const ignoreUser = (origin: Origin) => emit("ignore-user", origin);
const kickMember = (member: ChannelMember) => emit("kick-member", member);
const unignoreUser = (origin: Origin) => emit("unignore-user", origin);
const openChannelSettings = (event: Event) =>
	emit("open-channel-settings", event);
const openPrivate = (origin: Origin) => emit("open-private", origin);
const selectChannelMember = (origin: Origin) => emit("select-member", origin);
const sendMessage = (message: string) => emit("send-message", message);
const setAccessLevel = (
	member: ChannelMember,
	accessLevel: ChannelAccessLevel
) => emit("set-access-level", member, accessLevel);
const unsetAccessLevel = (
	member: ChannelMember,
	accessLevel: ChannelAccessLevel
) => emit("unset-access-level", member, accessLevel);
</script>

<template>
	<div class="room/channel [ flex ]" :data-room="room.name">
		<Room
			:completion-list="completionList"
			:disable-input="isDisabledInput"
			:current-client-nickname="currentNickname"
			:room="room"
			@change-nickname="changeNickname"
			@open-private="openPrivate"
			@send-message="sendMessage"
			@dblclick-main="openChannelSettings"
		>
			<template #topic>
				<input
					v-if="topicEditMode"
					ref="$topic"
					v-model="topicInput"
					class="[ input:reset size:full ]"
					type="text"
					@blur="submitTopicHandler"
					@keydown.enter="submitTopicHandler"
					@keydown.esc="submitTopicHandler"
				/>
				<output
					v-else-if="room.topic.get().length > 0"
					class="[ d-ib size:full p=1 select:none cursor:default ]"
					:class="{
						'cursor:pointer': currentClientMemberCanEditTopic,
					}"
					@dblclick="enableTopicEditModeHandler"
				>
					{{ room.topic.get() }}
				</output>

				<p
					v-else-if="currentClientMemberCanEditTopic"
					class="[ flex flex/center:full h:full my=0 select:none cursor:pointer ]"
					@dblclick="enableTopicEditModeHandler"
				>
					Appuyez deux fois sur cette section pour mettre à jour le
					sujet.
				</p>
				<p
					v-else
					class="[ flex flex/center:full h:full my=0 select:none cursor:default ]"
				>
					Aucun sujet
				</p>
			</template>

			<template #topic-action>
				<UiButton
					v-model:selected="displayUserlist"
					:true-value="true"
					:false-value="false"
					icon="users"
				/>

				<ButtonIcon class="close" icon="close" @click="closeRoom" />
			</template>

			<template #after-topic-before-main>
				<Alert type="warning" :close-after-seconds="15">
					Ne communique <strong>jamais</strong> tes coordonnées
					personnelles (nom, adresse, n° de téléphone...), ni tes
					identifiants de connexion.
				</Alert>
			</template>

			<template #history>
				<slot name="history" />
			</template>

			<template #room-info v-if="displayUserlist">
				<aside
					class="room/info [ flex! h:full pt=2 min-w=35 w=35 max-w=35 ]"
				>
					<ChannelUserlist
						:name="room.name"
						:users="room.users"
						class="room/userlist [ flex:full ov:h ]"
						@open-private="openPrivate"
						@select-member="selectChannelMember"
					/>

					<!-- <slot name="userlist-menu" /> -->
					<Match :maybe="currentClientMember.zip(selectedMember)">
						<template #some="{ data: [ccm, sm] }">
							<ChannelUserlistMenu
								:current-client-member="ccm"
								:selected-member="sm"
								@ignore-user="ignoreUser"
								@kick-member="kickMember"
								@open-private="openPrivate"
								@set-access-level="setAccessLevel"
								@unignore-user="unignoreUser"
								@unset-access-level="unsetAccessLevel"
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
		order: 1;
		~ div form {
			padding-right: 0;
		}
	}
}
</style>

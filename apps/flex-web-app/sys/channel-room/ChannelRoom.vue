<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { Option } from "@phisyx/flex-safety";
import { Alert, ButtonIcon, UiButton } from "@phisyx/flex-uikit";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";
import { ChannelTopic } from "~/channel/ChannelTopic";
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
	topic: ChannelTopic;
	users: ChannelUsers;
}

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let $topic = ref<HTMLInputElement>();
let topicEditMode = ref(false);
let topicInput = ref("");

const ignoreUserHandler = ignoreUser(emit);
const openPrivateHandler = openPrivate(emit);
const selectUserHandler = selectUser(emit);
const sendMessageHandler = sendMessage(emit, props.name);
const unignoreUserHandler = unignoreUser(emit);

function submitTopicHandler(evt: Event) {
	topicEditMode.value = false;

	evt.preventDefault();

	if (topicInput.value === props.topic.get()) {
		return;
	}

	emit("update-topic", props.name, topicInput.value);
}

function enableTopicEditModeHandler() {
	topicEditMode.value = true;
}

watchEffect(() => {
	if (topicEditMode.value === false) {
		topicInput.value = props.topic.get();
	}
});
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
				<input
					v-if="topicEditMode"
					ref="$topic"
					v-model="topicInput"
					class="[ input:reset ]"
					type="text"
					@blur="submitTopicHandler"
					@keydown.enter="submitTopicHandler"
					@keydown.esc="submitTopicHandler"
				/>
				<output
					v-else-if="topic.get().length > 0"
					@dblclick="enableTopicEditModeHandler()"
				>
					{{ topic }}
				</output>
				<p v-else>Aucun sujet</p>
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
		input {
			width: 100%;
			height: 100%;
		}
		output {
			display: inline-block;
			width: 100%;
			height: 100%;
			padding: fx.space(1);
			cursor: pointer;
		}
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

<script setup lang="ts">
import { Alert, ButtonIcon, UiButton } from "@phisyx/flex-uikit";
import {
	closeRoom,
	ignoreUser,
	openPrivate,
	selectUser,
	sendMessage,
	type Emits,
	unignoreUser,
	setAccessLevel,
	unsetAccessLevel,
	kickUser,
} from "./ChannelRoom.handlers";
import { useChannelTopic } from "./ChannelRoom.hooks";
import { type Props, displayUserlist } from "./ChannelRoom.state";

import ChannelUserlistMenu from "#/sys/channel-userlist-menu/ChannelUserlistMenu.vue";
import ChannelUserlist from "#/sys/channel-userlist/ChannelUserlist.vue";
import Match from "#/sys/match/Match.vue";
import Room from "#/sys/room/Room.vue";

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const closeRoomHandler = closeRoom(emit);
const ignoreUserHandler = ignoreUser(emit);
const kickUserHandler = kickUser(emit);
const openPrivateHandler = openPrivate(emit);
const selectUserHandler = selectUser(emit);
const sendMessageHandler = sendMessage(emit, props.name);
const setAccessLevelHandler = setAccessLevel(emit);
const unignoreUserHandler = unignoreUser(emit);
const unsetAccessLevelHandler = unsetAccessLevel(emit);

const {
	$topic,
	enableTopicEditModeHandler,
	submitTopicHandler,
	topicEditMode,
	topicInput,
} = useChannelTopic(props, emit);
</script>

<template>
	<div class="room/channel [ flex ]" :data-room="name">
		<Room
			:disable-input="disableInput"
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
					class="[ input:reset size:full ]"
					type="text"
					@blur="submitTopicHandler"
					@keydown.enter="submitTopicHandler"
					@keydown.esc="submitTopicHandler"
				/>
				<output
					v-else-if="topic.get().length > 0"
					class="[ d-ib size:full p=1 select:none cursor:default ]"
					:class="{
						'cursor:pointer': canEditTopic,
					}"
					@dblclick="enableTopicEditModeHandler()"
				>
					{{ topic.get() }}
				</output>

				<p
					v-else-if="canEditTopic"
					class="[ flex flex/center:full h:full my=0 select:none cursor:pointer ]"
					@dblclick="enableTopicEditModeHandler()"
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

				<ButtonIcon
					class="close"
					icon="close"
					@click="closeRoomHandler(name)"
				/>
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
						:name="name"
						:users="users"
						class="room/userlist [ flex:full ov:h ]"
						@open-private="openPrivateHandler"
						@select-user="selectUserHandler"
					/>

					<!-- <slot name="userlist-menu" /> -->
					<Match :maybe="me.zip(selectedUser)">
						<template #some="{ data: [me, selectedUser] }">
							<ChannelUserlistMenu
								:me="me"
								:user="selectedUser"
								@ignore-user="ignoreUserHandler"
								@kick-user="kickUserHandler"
								@open-private="openPrivateHandler"
								@set-access-level="setAccessLevelHandler"
								@unignore-user="unignoreUserHandler"
								@unset-access-level="unsetAccessLevelHandler"
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

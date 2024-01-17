<script setup lang="ts">
import { Room } from "~/room/Room";

import Match from "#/sys/match/Match.vue";
import NavigationRoom from "#/sys/navigation-room/NavigationRoom.vue";

// ---- //
// Type //
// ---- //

interface Props {
	active: boolean;
	connected: boolean;
	containerFolded?: boolean;
	folded: boolean;
	name: string;
	rooms: Array<Room>;
}

interface Emits {
	(evtName: "change-room", name: string): void;
	(evtName: "close-room", name: string): void;
}

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const folded = defineModel("folded");

function changeRoomHandler(evt: MouseEvent) {
	evt.preventDefault();

	emit("change-room", props.name);
}

function openRoomHandler(name: string) {
	emit("change-room", name);
}

function closeRoomHandler(name: string) {
	emit("close-room", name);
}

function toggleFoldHandler() {
	folded.value = !folded.value;
}
</script>

<template>
	<details open class="navigation-server [ list:reset }">
		<summary :class="{ 'is-active': active }" @click="changeRoomHandler">
			<span style="visibility: hidden">****</span>

			<span v-show="!containerFolded">{{ name }}</span>

			<icon-arrow-down
				v-if="connected === true && folded === false"
				key="arrow-down"
				@click.stop="toggleFoldHandler()"
			/>
			<icon-arrow-right
				v-else
				key="arrow-right"
				class="btn"
				@click.stop="toggleFoldHandler()"
			/>

			<icon-logoff v-if="connected == false" key="logoff" />
		</summary>

		<ul class="[ list:reset }">
			<template v-for="room in rooms" :key="room.type + ':' + room.name">
				<NavigationRoom
					v-if="room.type === 'channel'"
					:active="room.isActive()"
					:highlight="false"
					:name="room.name"
					:folded="containerFolded"
					:total-unread-events="room.totalUnreadEvents"
					:total-unread-messages="room.totalUnreadMessages"
					@open-room="openRoomHandler"
					@close-room="closeRoomHandler"
				>
					<template #icon>
						<icon-message />
					</template>
				</NavigationRoom>

				<NavigationRoom
					v-if="room.type === 'private'"
					:active="room.isActive()"
					:highlight="false"
					:name="room.name"
					:folded="containerFolded"
					:total-unread-events="room.totalUnreadEvents"
					:total-unread-messages="room.totalUnreadMessages"
					@open-room="openRoomHandler"
					@close-room="closeRoomHandler"
				>
					<template #icon>
						<icon-user />
					</template>

					<template #extra>
						<Match
							:maybe="
								room.lastMessage.filter(
									(m) =>
										!m.isMe && !m.type.startsWith('event')
								)
							"
						>
							<template #some="{ data: message }">
								<p class="[ scroll:y ]">
									{{ message.message }}
								</p>
							</template>
						</Match>
					</template>
				</NavigationRoom>
			</template>
		</ul>
	</details>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

summary {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: fx.space(1);
	cursor: pointer;

	min-height: fx.space(60);
}

.is-active {
	cursor: default;
	background: var(--room-bg);
}

p {
	min-height: fx.space(50);
	max-height: fx.space(60);

	font-size: 14px;

	justify-self: start;
	grid-column-start: 2;
	grid-column-end: 3;
	overflow-wrap: break-word;

	margin-block: 0;
	width: 100;
	padding: fx.space(1);
	border-radius: fx.space(1);
	cursor: pointer;
}
</style>

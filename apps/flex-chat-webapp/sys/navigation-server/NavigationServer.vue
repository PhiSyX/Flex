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
	id: CustomRoomID;
	name: CustomRoomID;
	rooms: Array<Room>;
}

// ---- //
// Type //
// ---- //

export interface Emits {
	(evtName: "change-room", origin: Origin | RoomID): void;
	(evtName: "close-room", origin: Origin | RoomID): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const folded = defineModel<boolean>("folded");

const openRoomHandler = (origin: Origin | RoomID) =>
	emit("change-room", origin);
const closeRoomHandler = (origin: Origin | RoomID) =>
	emit("close-room", origin);

function shouldBeListedInNav(room: Room) {
	return ["channel", "private", "notice-custom-room"].includes(room.type);
}

function changeRoomHandler(evt: Event) {
	evt.preventDefault();
	evt.stopPropagation();
	openRoomHandler(props.id);
}

function toggleFoldHandler() {
	folded.value = !folded.value;
}
</script>

<template>
	<details open class="navigation-server [ list:reset }">
		<summary
			:class="{ 'is-active': active }"
			class="[ flex align-i:center align-jc:sb p=1 cursor:pointer min-h=8 ]"
			@click="changeRoomHandler"
		>
			<icon-home />

			<span v-show="!containerFolded">{{ name }}</span>

			<icon-arrow-down
				v-if="connected === true && folded === false"
				key="arrow-down"
				v-show="!containerFolded"
				@click.stop="toggleFoldHandler()"
			/>
			<icon-arrow-right
				v-else
				key="arrow-right"
				v-show="!containerFolded"
				@click.stop="toggleFoldHandler()"
			/>

			<icon-logoff
				v-if="connected == false"
				key="logoff"
				v-show="!containerFolded"
			/>
		</summary>

		<ul class="[ list:reset }">
			<template v-for="room in rooms" :key="room.type + ':' + room.name">
				<NavigationRoom
					v-if="shouldBeListedInNav(room) && !room.isClosed()"
					:id="room.id()"
					:active="room.isActive() && !room.isClosed()"
					:highlight="room.highlighted"
					:name="room.name"
					:folded="containerFolded"
					:total-unread-events="room.totalUnreadEvents"
					:total-unread-messages="room.totalUnreadMessages"
					@open-room="openRoomHandler"
					@close-room="closeRoomHandler"
				>
					<template #icon>
						<icon-message v-if="room.type === 'channel'" />
						<icon-user v-else-if="room.type === 'private'" />
						<icon-notice
							v-else-if="room.type === 'notice-custom-room'"
						/>
					</template>

					<template v-if="room.type === 'private'" #extra>
						<Match
							:maybe="
								room.lastMessage.filter(
									(message) =>
										!message.isCurrentClient &&
										!message.type.startsWith('event')
								)
							"
						>
							<template #some="{ data: message }">
								<p
									class="[ scroll:y w:full min-h=6 max-h=8 my=0 p=1 cursor: pointer ]"
								>
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

.is-active {
	cursor: default;
	background: var(--room-bg);
	position: relative;

	--sb: #{fx.space(1)};
	--sbm: calc(0rem - #{fx.space(1)});

	&::before,
	&::after {
		content: "";

		position: absolute;
		display: inline-block;

		pointer-events: none;

		transition: background-color 200ms ease-in-out;

		height: var(--sb);
		width: var(--sb);
	}

	&:not(:first-child)::before {
		top: var(--sbm);
		right: 0;
		background: radial-gradient(
			circle at 0 0,
			transparent var(--sb),
			var(--room-bg) var(--sb)
		);
	}

	// &:not(:last-child)::after {
	&::after {
		bottom: var(--sbm);
		right: 0;
		background: radial-gradient(
			circle at 0 100%,
			transparent var(--sb),
			var(--room-bg) var(--sb)
		);
	}
}

p {
	font-size: 14px;
	justify-self: start;
	grid-column-start: 2;
	grid-column-end: 4;
	overflow-wrap: break-word;
	border-radius: 4px;
	background: var(--last-message-bg);
	color: var(--last-message-color);

	@include fx.theme using($name) {
		@if $name == ice {
			--last-message-bg: var(--color-blue-grey800);
			--last-message-color: var(--default-text-color);
		} @else if $name == light {
			--last-message-bg: var(--color-grey300);
			--last-message-color: var(--default-text-color);
		} @else if $name == dark {
			--last-message-bg: var(--color-grey800);
			--last-message-color: var(--default-text-color);
		}
	}
}
</style>

<script setup lang="ts">
import type { Room } from "@phisyx/flex-chat/room";

import Avatar from "#/api/avatar/Avatar.vue";
import Match from "#/sys/match/Match.vue";
import NavigationRoom from "#/sys/navigation_room/NavigationRoom.template.vue";

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
	(event_name: "change-room", origin: Origin | RoomID): void;
	(event_name: "close-room", origin: Origin | RoomID): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let folded = defineModel<boolean>("folded");

// ------- //
// Handler //
// ------- //

const open_room_handler = (origin: Origin | RoomID) =>
	emit("change-room", origin);
const close_room_handler = (origin: Origin | RoomID) =>
	emit("close-room", origin);

function should_be_listed_in_nav(room: Room) {
	return [
		"channel",
		"private",
		"mentions-custom-room",
		"notices-custom-room",
	].includes(room.type);
}

function change_room_handler(evt: Event) {
	evt.preventDefault();
	evt.stopPropagation();
	open_room_handler(props.id);
}

function toggle_fold_handler() {
	folded.value = !folded.value;
}
</script>

<template>
	<details open class="navigation-server [ list:reset }">
		<summary
			:class="{ 'is-active': active }"
			class="[ flex align-i:center align-jc:sb p=1 cursor:pointer min-h=8 ]"
			@click="change_room_handler"
		>
			<icon-home class="[ flex:shrink=0 ]" />

			<span v-show="!containerFolded" class="[ flex:shrink=0 px=2 ]">{{ name }}</span>

			<icon-arrow-down
				v-if="connected === true && folded === false"
				key="arrow-down"
				v-show="!containerFolded"
				class="[ flex:shrink=0 ]"
				@click.stop="toggle_fold_handler()"
			/>
			<icon-arrow-right
				v-else
				key="arrow-right"
				v-show="!containerFolded"
				class="[ flex:shrink=0 ]"
				@click.stop="toggle_fold_handler()"
			/>

			<icon-logoff
				v-if="connected == false"
				key="logoff"
				v-show="!containerFolded"
				class="[ flex:shrink=0 ]"
			/>
		</summary>

		<ul class="[ list:reset }">
			<template v-for="room in rooms" :key="room.type + ':' + room.name">
				<NavigationRoom
					v-if="should_be_listed_in_nav(room) && !room.is_closed()"
					:id="room.id()"
					:active="room.is_active() && !room.is_closed()"
					:highlight="room.highlighted"
					:name="room.name"
					:folded="containerFolded"
					:total-unread-events="room.total_unread_events"
					:total-unread-messages="room.total_unread_messages"
					@open-room="open_room_handler"
					@close-room="close_room_handler"
				>
					<template #icon>
						<icon-message
							v-if="room.type === 'channel'"
							class="[ flex:shrink=0 ]"
						/>
						<Avatar
							v-else-if="room.type === 'private'"
							:key="room.id()"
							:id="room.id()"
							:alt="`Avatar du compte de ${room.name}.`"
							class="[ flex:shrink=0 ]"
						/>
						<icon-notice
							v-else-if="room.type === 'notices-custom-room'"
							class="[ flex:shrink=0 ]"
						/>
						<icon-mention
							v-else-if="room.type === 'mentions-custom-room'"
							class="[ flex:shrink=0 ]"
						/>
					</template>

					<template v-if="room.type === 'private'" #extra>
						<Match
							:maybe="
								room.last_message.filter(
									(message) =>
										!message.is_current_client &&
										!message.type.startsWith('event')
								)
							"
						>
							<template #some="{ data: message }">
								<p
									class="[ scroll:y w:full min-h=6 max-hx=8 my=0 p=1 f-size=14px cursor:pointer ]"
									:class="{
										[`bgo-color${message.colors.background}`]: message.colors.background != null,
										[`fg-color${message.colors.foreground}`]: message.colors.foreground != null,

									}"
								>
									{{ message }}
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
@use "@phisyx/flexsheets" as fx;

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
	justify-self: start;
	grid-column-start: 2;
	grid-column-end: 4;
	overflow-wrap: break-word;
	border-radius: 4px;
	background: var(--last-message-bg);
	color: var(--last-message-color);

	@include fx.scheme using($name) {
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

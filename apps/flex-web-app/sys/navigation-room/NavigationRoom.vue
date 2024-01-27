<script setup lang="ts">
import { Badge, ButtonIcon } from "@phisyx/flex-uikit";

import { type Emits, openRoom, closeRoom } from "./NavigationRoom.handlers";
import {
	type Props,
	computeTotalUnread,
	computeHasUnreadEvents,
	computeHasUnreadMessages,
} from "./NavigationRoom.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const openRoomHandler = openRoom(emit, props.id);
const closeRoomHandler = closeRoom(emit, props.id);

const hasEvents = computeHasUnreadEvents(props);
const hasMessages = computeHasUnreadMessages(props);
const totalUnread = computeTotalUnread(props);
</script>

<template>
	<li
		:class="{
			'has-events': hasEvents,
			'has-messages': hasMessages,
			'is-active': active,
			'is-highlight': highlight,
		}"
		@click="openRoomHandler"
		@keypress.space="openRoomHandler"
		@keypress.enter="openRoomHandler"
		tabindex="0"
	>
		<slot name="icon" />

		<bdo
			v-show="!folded"
			:class="{ 'scroll:marquee': !name.startsWith('#') }"
		>
			{{ name }}
		</bdo>

		<div>
			<Badge
				v-if="hasEvents || hasMessages"
				v-show="!folded"
				class="total-unread"
			>
				{{ totalUnread }}
			</Badge>

			<ButtonIcon
				v-show="!folded"
				icon="close"
				class="close"
				@click="closeRoomHandler"
			/>
		</div>

		<slot name="extra" />
	</li>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

li {
	display: grid;
	grid-template-columns: fx.space(3) 1fr auto;
	align-items: center;
	justify-content: space-between;
	gap: fx.space(1);
	padding: fx.space(1);
	min-height: fx.space(6);
	border-left: 3px solid var(--navigation-room-border-left-color, transparent);

	cursor: pointer;

	&:focus-visible {
		outline: 1px ridge var(--navigation-room-focus-color, transparent);
	}
}

.close {
	display: none;
}

li:hover .close {
	display: inline-block;
}

.is-active {
	background: var(--room-bg);
	cursor: default !important;
	.close {
		display: block;
	}
}

.has-events {
	color: var(--navigation-room-events-color);
}

.has-messages {
	color: var(--navigation-room-messages-color);
}

.is-highlight {
	color: var(--navigation-room-highlight-color);
	animation: blink 1s step-start 0s infinite;
}

.total-unread {
	background: var(--navigation-total-unread-bg, var(--room-bg));
	color: var(--navigation-total-unread-color, inherit);
}

li:hover > div > .total-unread {
	display: none;
}

@keyframes blink {
	50% {
		opacity: var(--blink-opacity, 0.5);
	}
}
</style>

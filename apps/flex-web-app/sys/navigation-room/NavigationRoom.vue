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

const openRoomHandler = openRoom(emit, props.name);
const closeRoomHandler = closeRoom(emit, props.name);

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

		<bdi v-show="!folded">{{ name }}</bdi>

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
		outline: 1px ridge transparent;
		@include fx.theme using ($name) {
			@if $name == ice {
				outline-color: var(--color-grey600);
			}
		}
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

	@include fx.theme using ($name) {
		@if $name == ice {
			--navigation-room-border-left-color: var(--color-grey800);
		}
	}

	.close {
		display: block;
	}
}

.has-events {
	@include fx.theme using($name) {
		@if $name == ice {
			color: var(--color-blue300);
			--navigation-room-border-left-color: var(--color-blue500);
		}
	}
}

.has-messages {
	color: var(--color-red);
	@include fx.theme using ($name) {
		@if $name == ice {
			color: var(--color-orange400);
			--navigation-room-border-left-color: var(--color-orange700);
		}
	}
}

.is-highlight {
	color: var(--color-green);
	animation: blink 1s step-start 0s infinite;

	@include fx.theme using ($name) {
		@if $name == ice {
			color: var(--color-lime500);
			--navigation-room-border-left-color: var(--color-lime700);
		}
	}
}

.total-unread {
	@include fx.theme using ($name) {
		@if $name == ice {
			background: var(--room-bg);
		}
	}
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

<script setup lang="ts">
import { computed } from "vue";

import { Badge, ButtonIcon } from "@phisyx/flex-uikit";

// ---- //
// Type //
// ---- //

interface Props {
	active: boolean;
	name: string;
	folded?: boolean;
	highlight?: boolean;
	totalUnreadEvents?: number;
	totalUnreadMessages?: number;
};

type Emits = {
	(evtName: "open-room", name: string): void;
	(evtName: "close-room", name: string): void;
};

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const totalUnread = computed(() => {
	// FIXME
	// return toUserFriendly(
	// 	props.totalUnreadMessages || props.totalUnreadEvents || 0
	// );
	return props.totalUnreadMessages || props.totalUnreadEvents || 0;
});

function openRoomHandler(evt: Event) {
	evt.stopPropagation();
	emit("open-room", props.name);
}

function closeRoomHandler(evt: MouseEvent) {
	evt.stopPropagation();
	emit("close-room", props.name);
}
</script>

<template>
	<li
		:class="{
			'has-events': totalUnreadEvents || 0 > 0,
			'has-messages': totalUnreadMessages || 0 > 0,
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
				v-if="totalUnreadMessages || totalUnreadEvents"
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

<style lang="scss" scoped>
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

<script setup lang="ts">
import { computed, inject } from "vue";

import {
	Props,
	computeComponentEventExists,
	computeComponentEventName,
	computeIsEvent,
	computeChannelNick,
	computePrivateNick,
} from "./RoomMessage.state";

import Match from "#/sys/match/Match.vue";

import ChannelNickComponent from "#/sys/channel-nick/ChannelNick.vue";
import PrivateNickComponent from "#/sys/private-nick/PrivateNick.vue";

// ---- //
// Type //
// ---- //

interface Emits {
	(evtName: "open-private", origin: Origin): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const eventsComponents = inject<Array<string>>("eventsComponents");

const isEvent = computeIsEvent(props);
const componentEventExists = computeComponentEventExists(
	props,
	eventsComponents
);
const componentEventName = computeComponentEventName(props);

const maybeChannelNick = computeChannelNick(props);
const maybePrivateNick = computePrivateNick(props);

const isEventOrError = computed(() => {
	return (
		props.type.startsWith("error:err_") ||
		props.type.startsWith("event:rpl_")
	);
});
</script>

<template>
	<li
		:id="id"
		:data-archived="archived"
		:data-type="type"
		:data-myself="isMe"
		class="room/echo [ d-ib ]"
		:title="archived ? `Il s'agit d'un message archivé.` : undefined"
	>
		<template v-if="componentEventExists && isEvent">
			<component :is="componentEventName" v-bind="props" />
		</template>
		<template v-else>
			<time :datetime="time.datetime">
				{{ time.formattedTime }}
			</time>

			<template v-if="isEventOrError"> * </template>
			<template v-else>
				<Match :maybe="maybeChannelNick">
					<template #some="{ data: channelNick }">
						<ChannelNickComponent
							tag="span"
							:nickname="channelNick.nickname"
							:symbol="channelNick.highestAccessLevel.symbol"
							:classes="channelNick.className"
							:is-me="channelNick.isMe"
							prefix="<"
							suffix=">"
						/>
					</template>
				</Match>
				<Match :maybe="maybePrivateNick">
					<template #some="{ data: privateNick }">
						<PrivateNickComponent
							tag="span"
							:nickname="privateNick.nickname"
							:is-me="privateNick.isMe"
							suffix=" :"
						/>
					</template>
				</Match>
			</template>

			<p>{{ message }}</p>
		</template>
	</li>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/echo") {
	&[data-type="action"] {
		font-style: italic;
		color: var(--room-message-action-color);
	}

	&[data-archived="true"] {
		transition: opacity 200ms;
		opacity: 0.3;
		&:hover {
			opacity: 0.75;
		}
	}

	&[data-type*="error"] {
		cursor: default;
		font-style: italic;
		color: var(--room-message-error-color);
	}

	> *:not(:last-child) {
		margin-right: fx.space(1);
	}

	time {
		cursor: default;
		color: var(--room-message-time-color);
	}

	p {
		display: inline;
		line-height: 1.4rem;
		word-break: break-all;
		hyphens: manual;
	}
}
</style>

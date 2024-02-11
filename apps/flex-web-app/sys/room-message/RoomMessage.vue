<script setup lang="ts">
import { computed, inject } from "vue";

import { camelCase, kebabcase } from "@phisyx/flex-capitalization";
import { None, Some } from "@phisyx/flex-safety";

import { ChannelMember } from "~/channel/ChannelMember";
import { PrivateNick } from "~/private/PrivateNick";
import { User } from "~/user/User";

import Match from "#/sys/match/Match.vue";

import ChannelNickComponent from "#/sys/channel-nick/ChannelNick.vue";
import PrivateNickComponent from "#/sys/private-nick/PrivateNick.vue";

// ---- //
// Type //
// ---- //

interface Props {
	data: object & { origin: Origin | ChannelOrigin };
	archived: boolean;
	id: string;
	message: string;
	isMe: boolean;
	nickname: string;
	target: string;
	time: {
		datetime: string;
		formattedTime: string;
	};
	type:
		| "action"
		| `error:${string}`
		| "event"
		| `event:${string}`
		| "pubmsg"
		| "privmsg";
}

interface Emits {
	(evtName: "open-private", origin: Origin): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const eventsComponents = inject<Array<string>>("eventsComponents");

const isChannel = computed(
	() => props.nickname !== "*" && props.target.startsWith("#")
);

const isPrivate = computed(() => props.nickname !== "*" && !isChannel.value);

const maybeChannelMember = computed(() => {
	const cnick = new ChannelMember(new User(props.data.origin));
	if ("access_level" in props.data.origin) {
		cnick.withRawAccessLevel(props.data.origin.access_level);
	}
	return isChannel.value ? Some(cnick) : None();
});

const maybePrivateNick = computed(() => {
	return isPrivate.value
		? Some(
				new PrivateNick(new User(props.data.origin)).withIsMe(
					props.isMe
				)
		  )
		: None();
});

const isEvent = computed(() => props.type.startsWith("event:"));

const componentEventExists = computed(() => {
	const componentName = camelCase(componentEventName.value, {
		includes_separators: false,
	});
	return eventsComponents?.includes(componentName) ?? false;
});

const componentEventName = computed(() => kebabcase(`room:${props.type}`));

const isExternalMessage = computed(() => {
	if (props.type === "pubmsg") {
		const data = props.data as GenericReply<"PUBMSG">;
		if (data.external) return Some(data.origin);
	}
	return None();
});

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
		:data-external="isExternalMessage.is_some()"
		:data-type="type"
		:data-myself="isMe"
		class="room/echo [ d-i max-w:max ]"
		:title="archived ? `Il s'agit d'un message archivé.` : undefined"
		@dblclick.stop
	>
		<template v-if="componentEventExists && isEvent">
			<component :is="componentEventName" v-bind="props" />
		</template>
		<template v-else>
			<time :datetime="time.datetime">
				{{ time.formattedTime }}
			</time>

			<template v-if="isEventOrError"> * </template>
			<Match
				v-else-if="isExternalMessage.is_some()"
				:maybe="isExternalMessage"
			>
				<template #some="{ data: origin }">
					<em>(extern)</em>
					<span>-&lt; {{ origin.nickname }} &gt;-</span>
				</template>
			</Match>
			<template v-else>
				<Match :maybe="maybeChannelMember">
					<template #some="{ data: ChannelMember }">
						<ChannelNickComponent
							tag="span"
							:nickname="ChannelMember.nickname"
							:symbol="ChannelMember.highestAccessLevel.symbol"
							:classes="ChannelMember.className"
							:is-me="ChannelMember.isMe"
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

	&[data-external="true"] em {
		color: var(--room-message-error-color);
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

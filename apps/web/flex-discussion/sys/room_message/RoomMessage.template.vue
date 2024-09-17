<script setup lang="ts">
import type { RoomMessage } from "@phisyx/flex-chat/room/message";

import { camelcase, kebabcase } from "@phisyx/flex-capitalization";
import { is_channel } from "@phisyx/flex-chat/asserts/room";
import { ChannelMember } from "@phisyx/flex-chat/channel/member";
import { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import { None, Some } from "@phisyx/flex-safety";
import { computed, inject } from "vue";

import ChannelNick from "#/sys/channel_nick/ChannelNick.template.vue";
import Match from "#/sys/match/Match.vue";
import PrivateNick from "#/sys/private_nick/PrivateNick.template.vue";

// ---- //
// Type //
// ---- //

interface Props {
	message: RoomMessage<unknown, object>;
}

interface Emits {
	// biome-ignore lint/style/useShorthandFunctionType: tkt
	(event_name: "open-room", room_id: RoomID): void;
}

// --------- //
// Composant //
// --------- //

const { message } = defineProps<Props>();
const emit = defineEmits<Emits>();

// NOTE: fournit depuis main.ts
let events_components = inject<Array<string>>("events_components");

let _is_channel = computed(
	() => message.nickname !== "*" && is_channel(message.target),
);

let _is_private = computed(
	() => message.nickname !== "*" && !_is_channel.value,
);

let maybe_channel_member = computed(() => {
	let member = new ChannelMember(message.data.origin).with_is_current_client(
		message.is_current_client,
	);

	if (Object.hasOwn(message.data.origin, "access_level")) {
		member = member.with_access_level(...message.data.origin.access_level);
	}

	return _is_channel.value ? Some(member) : None();
});

let maybe_private_nick = computed(() =>
	_is_private.value
		? Some(
				new PrivateParticipant(
					message.data.origin,
				).with_is_current_client(message.is_current_client),
			)
		: None(),
);

let is_event = computed(() => message.type.startsWith("event:"));

let code = computed(() => {
	if (Object.hasOwn(message.data, "code")) {
		return message.data.code;
	}
	return undefined;
});

let event_name = computed(() => {
	if (Object.hasOwn(message.data, "name")) {
		return message.data.name;
	}
	return undefined;
});

let component_event_exists = computed(() => {
	let component_name = camelcase(component_event_name.value, {
		includes_separators: false,
	});
	return events_components?.includes(component_name) ?? false;
});

let component_event_name = computed(() => kebabcase(`room:${message.type}`));

let is_external_message = computed(() => {
	if (message.type === "pubmsg") {
		let data = message.data as GenericReply<"PUBMSG">;
		if (data.external) {
			return Some(data.origin);
		}
	}

	return None();
});

let is_event_or_error = computed(
	() =>
		message.type.startsWith("error:err_") ||
		message.type.startsWith("event:rpl_"),
);

// ------- //
// Handler //
// ------- //

const open_room_handler = (room_id: RoomID) => emit("open-room", room_id);
</script>

<template>
	<li
		:id="message.id"
		:data-archived="message.archived"
		:data-code="code"
		:data-event="event_name"
		:data-external="is_external_message.is_some()"
		:data-mention="message.mention"
		:data-myself="message.is_current_client"
		:data-type="message.type"
		class="room/echo [ display-i max-w:max w:full ]"
		:title="
			message.archived ? `Il s'agit d'un message archivé.` : undefined
		"
		@dblclick.stop
	>
		<strong v-if="message.mention">[mention]</strong>

		<template v-if="component_event_exists && is_event">
			<component
				:is="component_event_name"
				v-bind="message"
				@open-room="open_room_handler"
			/>
		</template>
		<template v-else>
			<time :datetime="message.time.datetime">
				{{ message.time.formatted_time }}
			</time>

			<template v-if="is_event_or_error"> * </template>
			<Match
				v-else-if="is_external_message.is_some()"
				:maybe="is_external_message"
			>
				<template #some="{ data: origin }">
					<em>(extern)</em>
					<span>-&lt; {{ origin.nickname }} &gt;-</span>
				</template>
			</Match>
			<template v-else>
				<Match :maybe="maybe_channel_member">
					<template #some="{ data: cnick }">
						<ChannelNick
							:member="cnick"
							:with-avatar="false"
							prefix="<"
							suffix=">"
							tag="span"
						/>
					</template>
				</Match>
				<Match :maybe="maybe_private_nick">
					<template #some="{ data: pnick }">
						<PrivateNick
							:participant="pnick"
							suffix=" :"
							tag="span"
						/>
					</template>
				</Match>
			</template>

			<p
				:class="{
					[`bg-color${message.colors?.background}`]:
						message?.colors?.background != null,
					[`fg-color${message.colors?.foreground}`]:
						message?.colors?.foreground != null,
					'text-bold': message?.formats?.bold,
					'text-italic': message?.formats?.italic,
					'text-underline': message?.formats?.underline,
				}"
			>
				{{ message }}
			</p>
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

	&[data-mention="true"] strong {
		font-weight: 600;
		color: var(--room-message-mention-color);
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

	q {
		color: var(--default-text-color);
		&::before {
			margin-right: 4px;
			color: var(--color-grey400);
		}
		&::after {
			margin-left: 4px;
			color: var(--color-grey400);
		}
	}
}
</style>

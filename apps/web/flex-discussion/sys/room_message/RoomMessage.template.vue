<script setup lang="ts">
import { computed, inject } from "vue";

import { camelcase, kebabcase } from "@phisyx/flex-capitalization";
import {
	ChannelMember,
	PrivateParticipant,
	is_channel,
} from "@phisyx/flex-chat";
import { None, Some } from "@phisyx/flex-safety";

import ChannelNick from "#/sys/channel_nick/ChannelNick.template.vue";
import Match from "#/sys/match/Match.vue";
import PrivateNickComponent from "#/sys/private_nick/PrivateNick.template.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	data: object & { origin: Origin | ChannelOrigin };
	archived: boolean;
	id: string;
	mention: boolean;
	message: string;
	isCurrentClient: boolean;
	nickname: string;
	target: unknown;
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

type Emits = (event_name: "open-room", room_id: RoomID) => void;

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// NOTE: fournit depuis main.ts
let events_components = inject<Array<string>>("events_components");

let _is_channel = computed(
	() => props.nickname !== "*" && is_channel(props.target),
);

let _is_private = computed(() => props.nickname !== "*" && !_is_channel.value);

let maybe_channel_member = computed(() => {
	let member = new ChannelMember(props.data.origin);
	
	if ("access_level" in props.data.origin) {
		member = member.with_access_level(props.data.origin.access_level);
	}

	return _is_channel.value ? Some(member) : None();
});

let maybe_private_nick = computed(
	() => _is_private.value
		? Some(
				new PrivateParticipant(props.data.origin)
					.with_is_current_client(props.isCurrentClient),
			)
		: None()
);

let is_event = computed(() => props.type.startsWith("event:"));

let component_event_exists = computed(() => {
	let component_name = camelcase(component_event_name.value, {
		includes_separators: false,
	});
	return events_components?.includes(component_name) ?? false;
});

let component_event_name = computed(() => kebabcase(`room:${props.type}`));

let is_external_message = computed(() => {
	if (props.type === "pubmsg") {
		let data = props.data as GenericReply<"PUBMSG">;
		if (data.external) {
			return Some(data.origin);
		}
	}

	return None();
});

let is_event_or_error = computed(
	() =>  (
		props.type.startsWith("error:err_") ||
		props.type.startsWith("event:rpl_")
	)
);

// ------- //
// Handler //
// ------- //

const open_room_handler = (room_id: RoomID) => emit("open-room", room_id);
</script>

<template>
	<li
		:id="id"
		:data-archived="archived"
		:data-external="is_external_message.is_some()"
		:data-mention="mention"
		:data-myself="isCurrentClient"
		:data-type="type"
		class="room/echo [ display-i max-w:max w:full ]"
		:title="archived ? `Il s'agit d'un message archivé.` : undefined"
		@dblclick.stop
	>
		<strong v-if="mention">[mention]</strong>

		<template v-if="component_event_exists && is_event">
			<component
				:is="component_event_name"
				v-bind="props"
				@open-room="open_room_handler"
			/>
		</template>
		<template v-else>
			<time :datetime="time.datetime">
				{{ time.formattedTime }}
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
							tag="span"
							:nickname="cnick.nickname"
							:symbol="cnick.access_level.highest.symbol"
							:classes="cnick.class_name"
							:is-current-client="cnick.is_current_client"
							prefix="<"
							suffix=">"
						/>
					</template>
				</Match>
				<Match :maybe="maybe_private_nick">
					<template #some="{ data: pnick }">
						<PrivateNickComponent
							tag="span"
							:nickname="pnick.nickname"
							:is-current-client="pnick.is_current_client"
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

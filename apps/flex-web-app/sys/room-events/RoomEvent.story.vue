<script setup lang="ts">
import { formatDate } from "@phisyx/flex-date";
import RoomEventJoin from "./RoomEventJoin.vue";
import RoomEventKick from "./RoomEventKick.vue";
import RoomEventMode from "./RoomEventMode.vue";
import RoomEventNick from "./RoomEventNick.vue";
import RoomEventPart from "./RoomEventPart.vue";
import RoomEventQuery from "./RoomEventQuery.vue";
import RoomEventQuit from "./RoomEventQuit.vue";
import RoomEventRplIgnore from "./RoomEventRplIgnore.vue";
import RoomEventRplUnignore from "./RoomEventRplUnignore.vue";

type Payload = {
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
		| "privmsg";
};

const origin: Origin = {
	id: "uuid0",
	host: { cloaked: "localhost" },
	ident: "ident",
	nickname: "PhiSyX",
};

const time = {
	datetime: new Date().toISOString(),
	formattedTime: formatDate("`H:i:s`", new Date()),
};

const tags = { msgid: "msgid" };
const payload: Payload = {
	id: "event-id",
	isMe: false,
	message: "",
	nickname: "PhiSyX",
	target: "#channel",
	time: time,
	type: "event:join",
};

const eventJoin: Payload & { data: GenericReply<"JOIN"> } = {
	data: {
		channel: "#channel",
		forced: false,
		name: "JOIN",
		origin,
		tags,
	},
	...payload,
};
const eventKick: Payload & { data: GenericReply<"KICK"> } = {
	data: {
		channel: "#channel",
		name: "KICK",
		knick: origin,
		reason: "Dehors !",
		origin,
		tags,
	},
	...payload,
};
const eventMode1: Payload & { data: GenericReply<"MODE"> } = {
	data: {
		added: [
			[
				"t",
				{
					flag: "no_topic",
					args: [],
					updated_at: new Date().toString(),
					updated_by: "Nickname",
				},
			],
		],
		removed: [] as unknown as GenericReply<"MODE">["removed"],
		target: "#channel",
		updated: false,
		name: "MODE",
		origin,
		tags,
	},
	...payload,
};
const eventMode2: Payload & { data: GenericReply<"MODE"> } = {
	data: {
		added: [
			[
				"t",
				{
					flag: "no_topic",
					args: [],
					updated_at: new Date().toString(),
					updated_by: "PhiSyX",
				},
			],
		],
		removed: [] as unknown as GenericReply<"MODE">["removed"],
		target: "#channel",
		updated: true,
		name: "MODE",
		origin,
		tags,
	},
	...payload,
};
const eventNick: Payload & { data: GenericReply<"NICK"> } = {
	data: {
		name: "NICK",
		new_nickname: "NewNick",
		old_nickname: "currentNick",
		origin,
		tags,
	},
	...payload,
};
const eventPart: Payload & { data: GenericReply<"PART"> } = {
	data: {
		name: "PART",
		channel: "#channel",
		message: "Bye les ploucs.",
		forced_by: null,
		origin,
		tags,
	},
	...payload,
};
const eventQuery: Payload & {
	data: { origin: Origin; text: string };
} = {
	data: {
		text: "Un message privé",
		origin,
	},
	...payload,
};
const eventQuit: Payload & {
	data: GenericReply<"QUIT">;
} = {
	data: {
		message: "Message de déconnexion",
		name: "QUIT",
		origin,
		tags,
	},
	...payload,
};
const eventRplIgnore: Payload & {
	data: GenericReply<"RPL_IGNORE">;
} = {
	data: {
		message: "message",
		code: 1,
		name: "RPL_IGNORE",
		updated: true,
		users: [origin],
		origin,
		tags,
	},
	...payload,
};
const eventRplUnignore: Payload & {
	data: GenericReply<"RPL_UNIGNORE">;
} = {
	data: {
		message: "message",
		code: 1,
		name: "RPL_UNIGNORE",
		users: [origin],
		origin,
		tags,
	},
	...payload,
};
</script>

<template>
	<Story
		title="Atoms/RoomEvent"
		:layout="{ type: 'grid', width: 400 }"
		responsive-disabled
	>
		<Variant title="Join Event">
			<div class="room/echo">
				<RoomEventJoin v-bind="eventJoin" />
			</div>
		</Variant>

		<Variant title="Kick Event">
			<div class="room/echo">
				<RoomEventKick v-bind="eventKick" />
			</div>
		</Variant>

		<Variant title="Mode Event">
			<div class="room/echo">
				<RoomEventMode v-bind="eventMode1" />
			</div>
		</Variant>

		<Variant title="Mode Event">
			<div class="room/echo">
				<RoomEventMode v-bind="eventMode2" />
			</div>
		</Variant>

		<Variant title="Nick Event">
			<div class="room/echo">
				<RoomEventNick v-bind="eventNick" />
			</div>
		</Variant>

		<Variant title="Part Event">
			<div class="room/echo">
				<RoomEventPart v-bind="eventPart" />
			</div>
		</Variant>

		<Variant title="Query Event">
			<div class="room/echo">
				<RoomEventQuery v-bind="eventQuery" />
			</div>
		</Variant>

		<Variant title="Quit Event">
			<div class="room/echo">
				<RoomEventQuit v-bind="eventQuit" />
			</div>
		</Variant>

		<Variant title="Reply Ignore Event">
			<div class="room/echo">
				<RoomEventRplIgnore v-bind="eventRplIgnore" />
			</div>
		</Variant>
		<Variant title="Reply Unignore Event">
			<div class="room/echo">
				<RoomEventRplUnignore v-bind="eventRplUnignore" />
			</div>
		</Variant>
	</Story>
</template>

<style>
.room\/echo {
	display: inline-block;

	&[data-type="action"] {
		font-style: italic;
		color: var(--room-message-action-color);
	}

	&[data-type*="error"] {
		cursor: default;
		font-style: italic;
		color: var(--room-message-error-color);
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

	em {
		font-style: italic;
	}

	strong {
		font-weight: 800;
	}
}
</style>

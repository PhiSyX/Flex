<script setup lang="ts">
import { inject } from "vue";
import {
	Props,
	computeComponentEventExists,
	computeComponentEventName,
	computeIsEvent,
} from "./RoomMessage.state";

// ---- //
// Type //
// ---- //

interface Emits {
	(evtName: "open-private", nickname: string): void;
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
</script>

<template>
	<li :data-type="type" :data-myself="isMe" class="room/echo">
		<template v-if="componentEventExists && isEvent">
			<component :is="componentEventName" v-bind="props" />
		</template>
		<template v-else>
			<time :datetime="time.datetime">
				{{ time.formattedTime }}
			</time>
			<p>{{ message }}</p>
		</template>
	</li>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/echo") {
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

	em {
		font-style: italic;
	}

	strong {
		font-weight: 800;
	}
}
</style>

<script setup lang="ts">
import { Badge, ButtonIcon } from "@phisyx/flex-vue-uikit";
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	active: boolean;
	id: RoomID;
	name: RoomID;
	folded?: boolean;
	highlight?: boolean;
	totalUnreadEvents?: number;
	totalUnreadMessages?: number;
}

interface Emits {
	(evtName: "open-room", origin: Origin | RoomID): void;
	(evtName: "close-room", origin: Origin | RoomID): void;
}

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Est-ce qu'il y un total des événements non lus supérieur à zéro.
const hasUnreadEvents = computed(() => (props.totalUnreadEvents || 0) > 0);

// Est-ce qu'il y un total des messages non lus supérieur à zéro.
const hasUnreadMessages = computed(() => (props.totalUnreadMessages || 0) > 0);

// Nombre total des messages ou des événements reçus.
const totalUnread = computed(() => {
	// FIXME
	// return toUserFriendly(
	// 	totalUnreadMessages || totalUnreadEvents || 0
	// );
	return props.totalUnreadMessages || props.totalUnreadEvents || 0;
});

// Attribute title: nom
const nameTitleAttr = computed(() => {
	let title = `${props.name} :\n`;

	if (props.highlight) {
		title +=
			"· Cet onglet clignote car quelqu'un a écrit votre pseudo dans la conversation. (Highlight)\n";
	}

	title += "· Fermer la chambre avec :\n";
	title += "  - la touche du clavier ESC (échap)\n";
	title += "  - le bouton du milieu de votre souris\n";

	if (props.name.startsWith("#")) {
		if (!props.active) {
			title += "\n";
			title += "· Rejoindre le salon avec :\n";
			title += "  - un simple clique\n";
			title += "  - la touche du clavier ESPACE\n";
		}
		return title;
	}

	title += `· Discuter avec ${props.name} avec un simple clique\n`;

	return title;
});

// Attribute title: fermeture
const btnCloseAttrTitle = computed(() => {
	let title = `${props.name}:\n`;
	title += props.name.startsWith("#")
		? "· Partir du salon (Commande /part)"
		: "· Fermer la fenêtre de discussion";
	return title;
});

const openRoom = () => emit("open-room", props.id);
const closeRoom = () => emit("close-room", props.id);
</script>

<template>
	<li
		:class="{
			'has-events': hasUnreadEvents,
			'has-messages': hasUnreadMessages,
			'is-active': active,
			'is-highlight': highlight,
		}"
		:data-room="name"
		@click="openRoom"
		@click.middle="closeRoom"
		@keypress.space="openRoom"
		@keypress.enter="openRoom"
		@keydown.esc="closeRoom"
		tabindex="0"
	>
		<slot name="icon" />

		<bdo
			v-show="!folded"
			:class="{ '...': !name.startsWith('#') }"
			:title="nameTitleAttr"
		>
			{{ name }}
		</bdo>

		<div>
			<Badge
				v-if="hasUnreadEvents || hasUnreadMessages"
				v-show="!folded"
				class="total-unread"
			>
				{{ totalUnread }}
			</Badge>

			<ButtonIcon
				v-show="!folded"
				icon="close"
				class="close"
				@click="closeRoom"
				:title="btnCloseAttrTitle"
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

bdo {
	direction: ltr;
}

.close {
	visibility: hidden;
}

li:hover .close {
	visibility: visible;
}

.is-active {
	background: var(--room-bg);
	cursor: default !important;
	.close {
		visibility: visible;
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
	visibility: hidden;
}

li:not(:hover) > div > .total-unread + .close {
	display: none;
}

@keyframes blink {
	50% {
		opacity: var(--blink-opacity, 0.5);
	}
}
</style>

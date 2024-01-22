<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";

import {
	openPrivate,
	ignoreUser,
	unignoreUser,
	type Emits,
} from "./ChannelUserlistMenu.handler";
import { type Props, computeIsMe } from "./ChannelUserlistMenu.state";

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isMe = computeIsMe(props);

const openPrivateHandler = openPrivate(emit, props);
const ignoreUserHandler = ignoreUser(emit, props);
const unignoreUserHandler = unignoreUser(emit, props);
</script>

<template>
	<menu class="room/userlist:menu [ list:reset ]">
		<li>
			<p>
				<bdi>{{ user.cnick.nickname }}</bdi>
				<span>!</span>
				<bdi>{{ user.cnick.ident }}</bdi>
				<span>@</span>
				<span>{{ user.cnick.hostname }}</span>
			</p>
		</li>
		<li>
			<UiButton
				icon="user"
				position="right"
				title="Commande /query"
				class="btn/primary"
				@click="openPrivateHandler()"
			>
				<span v-if="!isMe">Discuter en privé</span>
				<span v-else>Ouvrir mon privé</span>
			</UiButton>
		</li>
		<li v-if="!isMe">
			<UiButton
				v-if="!user.isBlocked"
				icon="user-block"
				position="right"
				title="Commande /ignore <nickname>"
				class="btn/primary"
				@click="ignoreUserHandler()"
			>
				<span>Ignorer</span>
			</UiButton>
			<UiButton
				v-else
				icon="user-block"
				position="right"
				title="Commande /unignore <nickname>"
				class="btn/primary"
				:selected="user.isBlocked"
				:true-value="true"
				:false-value="false"
				@click="unignoreUserHandler()"
			>
				<span>Ne plus ignorer</span>
			</UiButton>
		</li>
	</menu>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/userlist:menu") {
	font-size: 14px;
	display: flex;
	flex-direction: column;
	margin: fx.space(1);

	@include fx.theme using ($name) {
		@if $name == ice {
			--btn-primary-bg: var(--color-blue-grey600);
			--btn-primary-bg-hover: var(--color-blue-grey700);
			--btn-secondary-bg: var(--room-bg);
			--btn-secondary-bg-hover: var(--body-bg_alt);
		}
	}

	li {
		display: flex;
		align-items: center;

		&:first-child {
			border-top-right-radius: 4px;
			border-top-left-radius: 4px;
			overflow: clip;
		}

		&:last-child {
			border-bottom-right-radius: 4px;
			border-bottom-left-radius: 4px;
			overflow: clip;
		}
	}

	li > p {
		font-size: 12px;
		flex-grow: 1;
		text-align: center;
		user-select: none;
		color: var(--color-grey400);
	}

	button {
		flex-grow: 1;
		justify-content: space-between;
		padding: fx.space(1);
		border: 1px inset transparent;
		transition: background-color 200ms;
		cursor: pointer;

		&:active {
			border-color: var(--color-white);
		}
	}

	button > svg {
		width: auto;
	}
}
</style>

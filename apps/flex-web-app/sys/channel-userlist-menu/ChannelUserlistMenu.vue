<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";

import {
	openPrivate,
	ignoreUser,
	unignoreUser,
	type Emits,
	setAccessLevel,
	unsetAccessLevel,
} from "./ChannelUserlistMenu.handler";

import {
	type Props,
	computeIsMe,
	computeIHaveAccessLevel,
} from "./ChannelUserlistMenu.state";

import ChannelUserlistOwnerMenu from "./ChannelUserlistAccessLevelQOPMenu.vue";
import ChannelUserlistAdminOperatorMenu from "./ChannelUserlistAccessLevelAOPMenu.vue";
import ChannelUserlistOperatorMenu from "./ChannelUserlistAccessLevelOPMenu.vue";
import ChannelUserlistHalfOperatorMenu from "./ChannelUserlistAccessLevelHOPMenu.vue";

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isMe = computeIsMe(props);
const iHaveAccessLevel = computeIHaveAccessLevel(props);

const openPrivateHandler = openPrivate(emit, props);
const ignoreUserHandler = ignoreUser(emit, props);
const unignoreUserHandler = unignoreUser(emit, props);
const setAccessLevelHandler = setAccessLevel(emit);
const unsetAccessLevelHandler = unsetAccessLevel(emit);
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
				variant="primary"
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
				variant="primary"
				@click="ignoreUserHandler()"
			>
				<span>Ignorer</span>
			</UiButton>
			<UiButton
				v-else
				icon="user-block"
				position="right"
				title="Commande /unignore <nickname>"
				variant="primary"
				:selected="user.isBlocked"
				:true-value="true"
				:false-value="false"
				@click="unignoreUserHandler()"
			>
				<span>Ne plus ignorer</span>
			</UiButton>
		</li>

		<li v-if="iHaveAccessLevel" class="room/userlist:menu/level-access">
			<ChannelUserlistOwnerMenu
				:disabled="disabled"
				:is-me="isMe"
				:me="me"
				:user="user"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
			<ChannelUserlistAdminOperatorMenu
				:disabled="disabled"
				:is-me="isMe"
				:me="me"
				:user="user"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
			<ChannelUserlistOperatorMenu
				:disabled="disabled"
				:is-me="isMe"
				:me="me"
				:user="user"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
			<ChannelUserlistHalfOperatorMenu
				:disabled="disabled"
				:is-me="isMe"
				:me="me"
				:user="user"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
		</li>

		<li v-if="!isMe" title="TODO">
			<UiButton
				disabled
				icon="report"
				position="right"
				:with-opacity="true"
				variant="danger"
			>
				Signaler
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
			--btn-secondary-bg: var(--color-blue-grey700);
			--btn-secondary-bg-hover: var(--color-blue-grey500);
			--btn-danger-disabled-color: var(--color-red900);
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

@include fx.class("room/userlist:menu/level-access") {
	display: flex;
}
</style>

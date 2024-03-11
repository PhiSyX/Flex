<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import type { ChannelMember } from "~/channel/ChannelMember";
import type { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";

import { ChannelAccessLevelFlag } from "~/channel/ChannelAccessLevel";

import ChannelUserlistAdminOperatorMenu from "./ChannelUserlistAccessLevelAOPMenu.vue";
import ChannelUserlistHalfOperatorMenu from "./ChannelUserlistAccessLevelHOPMenu.vue";
import ChannelUserlistOperatorMenu from "./ChannelUserlistAccessLevelOPMenu.vue";
import ChannelUserlistOwnerMenu from "./ChannelUserlistAccessLevelQOPMenu.vue";

// ---- //
// Type //
// ---- //

export interface Props {
	disabled?: boolean;
	currentClientMember: ChannelMember;
	selectedMember: ChannelMemberSelected;
}

export interface Emits {
	(evtName: "ban-member", member: ChannelMember): void;
	(evtName: "ban-nick", member: ChannelMember): void;
	(evtName: "ignore-user", user: Origin): void;
	(evtName: "kick-member", member: ChannelMember): void;
	(evtName: "open-private", user: Origin): void;
	(evtName: "set-access-level", member: ChannelMember, accessLevel: ChannelAccessLevelFlag): void;
	(evtName: "unban-member", member: ChannelMemberSelected): void;
	(evtName: "unban-nick", member: ChannelMemberSelected): void;
	(evtName: "unignore-user", user: Origin): void;
	(evtName: "unset-access-level", member: ChannelMember, accessLevel: ChannelAccessLevelFlag): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isSameMember = computed(() =>
	props.currentClientMember.partialEq(props.selectedMember.member),
);

const isCurrentClientMemberGlobalOperator = computed(() =>
	props.currentClientMember.isGlobalOperator(),
);

const isCurrentClientMemberHaveAccessLevel = computed(
	() => props.currentClientMember.accessLevel.highest.level > ChannelAccessLevelFlag.Vip,
);

const banMemberHandler = () => emit("ban-member", props.selectedMember.member);
const banMemberNickHandler = () => emit("ban-nick", props.selectedMember.member);
const unbanMemberHandler = () => emit("unban-member", props.selectedMember);
const unbanMemberNickHandler = () => emit("unban-nick", props.selectedMember);

const openPrivateHandler = () => emit("open-private", props.selectedMember.member);
const ignoreUserHandler = () => emit("ignore-user", props.selectedMember.member);
const kickMemberHandler = () => emit("kick-member", props.selectedMember.member);
const unignoreUserHandler = () => emit("unignore-user", props.selectedMember.member);
const setAccessLevelHandler = (member: ChannelMember, accessLevel: ChannelAccessLevelFlag) =>
	emit("set-access-level", member, accessLevel);
const unsetAccessLevelHandler = (member: ChannelMember, accessLevel: ChannelAccessLevelFlag) =>
	emit("unset-access-level", member, accessLevel);
</script>

<template>
	<menu class="room/userlist:menu [ list:reset flex! m=1 ]">
		<li>
			<p>
				<bdo>{{ selectedMember.member.nickname }}</bdo>
				<span>!</span>
				<bdo>{{ selectedMember.member.ident }}</bdo>
				<span>@</span>
				<span>{{ selectedMember.member.hostname }}</span>
			</p>
		</li>
		<li>
			<UiButton
				icon="user"
				position="right"
				title="Commande /query"
				variant="primary"
				@click="openPrivateHandler"
			>
				<span v-if="!isSameMember">Discuter en privé</span>
				<span v-else>Ouvrir mon privé</span>
			</UiButton>
		</li>
		<li v-if="!isSameMember">
			<UiButton
				v-if="!selectedMember.isBlocked"
				icon="user-block"
				position="right"
				title="Commande /ignore <nickname>"
				variant="primary"
				@click="ignoreUserHandler"
			>
				<span>Ignorer</span>
			</UiButton>
			<UiButton
				v-else
				icon="user-block"
				position="right"
				title="Commande /unignore <nickname>"
				variant="primary"
				:selected="selectedMember.isBlocked"
				:true-value="true"
				:false-value="false"
				@click="unignoreUserHandler"
			>
				<span>Ne plus ignorer</span>
			</UiButton>
		</li>

		<li
			v-if="
				(isCurrentClientMemberGlobalOperator ||
					isCurrentClientMemberHaveAccessLevel) &&
				!isSameMember
			"
		>
			<UiButton
				:disabled="disabled"
				variant="secondary"
				title="Commande /kick"
				@click="kickMemberHandler"
			>
				Kick
			</UiButton>

			<UiButton
				v-if="!selectedMember.isBanned"
				:disabled="disabled"
				variant="secondary"
				title="Commande /ban"
				@click="banMemberHandler"
			>
				Ban
			</UiButton>
			<UiButton
				v-else
				:disabled="disabled"
				variant="secondary"
				title="Commande /unban"
				@click="unbanMemberHandler"
			>
				Unban
			</UiButton>

			<UiButton
				v-if="!selectedMember.isNickBanned"
				:disabled="disabled"
				variant="secondary"
				title="Commande /bannick"
				@click="banMemberNickHandler"
			>
				Bannick
			</UiButton>
			<UiButton
				v-else
				:disabled="disabled"
				variant="secondary"
				title="Commande /unbannick"
				@click="unbanMemberNickHandler"
			>
				Unbannick
			</UiButton>
		</li>

		<li
			v-if="
				isCurrentClientMemberGlobalOperator ||
				isCurrentClientMemberHaveAccessLevel
			"
			class="[ flex ]"
		>
			<ChannelUserlistOwnerMenu
				:disabled="disabled"
				:is-same-member="isSameMember"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
			<ChannelUserlistAdminOperatorMenu
				:disabled="disabled"
				:is-same-member="isSameMember"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
			<ChannelUserlistOperatorMenu
				:disabled="disabled"
				:is-same-member="isSameMember"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
			<ChannelUserlistHalfOperatorMenu
				:disabled="disabled"
				:is-same-member="isSameMember"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="setAccessLevelHandler"
				@unset-access-level="unsetAccessLevelHandler"
			/>
		</li>

		<li v-if="!isSameMember" title="TODO">
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
		--btn-primary-outline: 0;
		--btn-secondary-outline: 0;
		--btn-danger-outline: 0;

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

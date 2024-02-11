<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";

import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";

import ChannelUserlistOwnerMenu from "./ChannelUserlistAccessLevelQOPMenu.vue";
import ChannelUserlistAdminOperatorMenu from "./ChannelUserlistAccessLevelAOPMenu.vue";
import ChannelUserlistOperatorMenu from "./ChannelUserlistAccessLevelOPMenu.vue";
import ChannelUserlistHalfOperatorMenu from "./ChannelUserlistAccessLevelHOPMenu.vue";
import { computed } from "vue";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { UserFlag } from "~/user/User";

// ---- //
// Type //
// ---- //

export interface Props {
	disabled?: boolean;
	currentClientMember: ChannelMember;
	selectedMember: ChannelMemberSelected;
}

export interface Emits {
	(evtName: "ignore-user", user: Origin): void;
	(evtName: "kick-member", cnick: ChannelMember): void;
	(evtName: "open-private", user: Origin): void;
	(
		evtName: "set-access-level",
		cnick: ChannelMember,
		accessLevel: ChannelAccessLevel
	): void;
	(evtName: "unignore-user", user: Origin): void;
	(
		evtName: "unset-access-level",
		cnick: ChannelMember,
		accessLevel: ChannelAccessLevel
	): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isSameMember = computed(() =>
	props.currentClientMember.partialEq(props.selectedMember.cnick)
);

const isCurrentClientMemberGlobalOperator = computed(() =>
	props.currentClientMember
		.intoUser()
		.operator.filter((flag) => flag === UserFlag.GlobalOperator)
		.is_some()
);

const isCurrentClientMemberHaveAccessLevel = computed(
	() =>
		props.currentClientMember.highestAccessLevel.level >
		ChannelAccessLevel.Vip
);

const openPrivateHandler = () =>
	emit("open-private", props.selectedMember.cnick.intoUser());
const ignoreUserHandler = () =>
	emit("ignore-user", props.selectedMember.cnick.intoUser());
const kickMemberHandler = () => emit("kick-member", props.selectedMember.cnick);
const unignoreUserHandler = () =>
	emit("unignore-user", props.selectedMember.cnick.intoUser());
const setAccessLevelHandler = (
	cnick: ChannelMember,
	accessLevel: ChannelAccessLevel
) => emit("set-access-level", cnick, accessLevel);
const unsetAccessLevelHandler = (
	cnick: ChannelMember,
	accessLevel: ChannelAccessLevel
) => emit("unset-access-level", cnick, accessLevel);
</script>

<template>
	<menu class="room/userlist:menu [ list:reset flex! m=1 ]">
		<li>
			<p>
				<bdo>{{ selectedMember.cnick.nickname }}</bdo>
				<span>!</span>
				<bdo>{{ selectedMember.cnick.ident }}</bdo>
				<span>@</span>
				<span>{{ selectedMember.cnick.hostname }}</span>
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
				:selected="selectedMember.isBlocked"
				:true-value="true"
				:false-value="false"
				@click="unignoreUserHandler()"
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

<script setup lang="ts">
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelMemberSelected } from "@phisyx/flex-chat/channel/member/selected";

import { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import { computed } from "vue";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";

import ChannelUserlistAdminOperatorMenu from "./MenuChannelUserlistAccessLevelAOP.vue";
import ChannelUserlistHalfOperatorMenu from "./MenuChannelUserlistAccessLevelHOP.vue";
import ChannelUserlistOperatorMenu from "./MenuChannelUserlistAccessLevelOP.vue";
import ChannelUserlistOwnerMenu from "./MenuChannelUserlistAccessLevelQOP.vue";

// ---- //
// Type //
// ---- //

export interface Props {
	disabled?: boolean;
	currentClientMember: ChannelMember;
	selectedMember: ChannelMemberSelected;
}

export interface Emits {
	(event_name: "ban-member", member: ChannelMember): void;
	(event_name: "ban-nick", member: ChannelMember): void;
	(event_name: "ignore-user", user: Origin): void;
	(event_name: "kick-member", member: ChannelMember): void;
	(event_name: "open-private", user: Origin): void;
	(
		event_name: "set-access-level",
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	): void;
	(event_name: "unban-member", member: ChannelMemberSelected): void;
	(event_name: "unban-nick", member: ChannelMemberSelected): void;
	(event_name: "unignore-user", user: Origin): void;
	(
		event_name: "unset-access-level",
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let is_same_member = computed(() =>
	props.currentClientMember.partial_eq(props.selectedMember.member),
);

let is_current_client_member_global_operator = computed(() =>
	props.currentClientMember.is_global_operator(),
);

let is_current_client_member_have_vip = computed(() =>
	props.currentClientMember.access_level.gt(ChannelAccessLevelFlag.Vip),
);

// ------- //
// Handler //
// ------- //

const ban_member_handler = () =>
	emit("ban-member", props.selectedMember.member);
const ban_nick_handler = () => emit("ban-nick", props.selectedMember.member);
const unban_member_handler = () => emit("unban-member", props.selectedMember);
const unban_nick_handler = () => emit("unban-nick", props.selectedMember);
const open_private_handler = () =>
	emit("open-private", props.selectedMember.member);
const ignore_user_handler = () =>
	emit("ignore-user", props.selectedMember.member);
const kick_member_handler = () =>
	emit("kick-member", props.selectedMember.member);
const unignore_user_handler = () =>
	emit("unignore-user", props.selectedMember.member);
const set_access_level_handler = (
	member: ChannelMember,
	access_level_flag: ChannelAccessLevelFlag,
) => emit("set-access-level", member, access_level_flag);
const unset_access_level_handler = (
	member: ChannelMember,
	access_level_flag: ChannelAccessLevelFlag,
) => emit("unset-access-level", member, access_level_flag);
</script>

<template>
	<menu class="room/userlist:menu [ list:reset flex! m=1 f-size=14px ]">
		<li>
			<p class="[ flex:full align-t:center f-size=12px select:none ]">
				<bdo>{{ selectedMember.member.nickname }}</bdo>
				<span>!</span>
				<bdo>{{ selectedMember.member.ident }}</bdo>
				<span>@</span>
				<span>{{ selectedMember.member.hostname }}</span>
			</p>
		</li>

		<li>
			<Button
				icon="user"
				icon-position="right"
				title="Commande /query"
				variant="primary"
				@click="open_private_handler"
			>
				<span v-if="!is_same_member">Discuter en privé</span>
				<span v-else>Ouvrir mon privé</span>
			</Button>
		</li>
		<li v-if="!is_same_member">
			<Button
				v-if="!selectedMember.is_blocked"
				icon="user-block"
				icon-position="right"
				title="Commande /ignore <nickname>"
				variant="primary"
				@click="ignore_user_handler"
			>
				<span>Ignorer</span>
			</Button>
			<Button
				v-else
				icon="user-block"
				icon-position="right"
				title="Commande /unignore <nickname>"
				variant="primary"
				:selected="selectedMember.is_blocked"
				:true-value="true"
				:false-value="false"
				@click="unignore_user_handler"
			>
				<span>Ne plus ignorer</span>
			</Button>
		</li>

		<li
			v-if="
				(is_current_client_member_global_operator ||
					is_current_client_member_have_vip) &&
				!is_same_member
			"
		>
			<Button
				:disabled="disabled"
				variant="secondary"
				title="Commande /kick"
				@click="kick_member_handler"
			>
				Expulser
			</Button>

			<Button
				v-if="!selectedMember.is_banned"
				:disabled="disabled"
				variant="secondary"
				title="Commande /ban"
				@click="ban_member_handler"
			>
				Bannir
			</Button>
			<Button
				v-else
				:disabled="disabled"
				variant="secondary"
				title="Commande /unban"
				@click="unban_member_handler"
			>
				Débannir
			</Button>

			<Button
				v-if="!selectedMember.is_nick_banned"
				:disabled="disabled"
				variant="secondary"
				title="Commande /bannick"
				@click="ban_nick_handler"
			>
				Bannir pseudo
			</Button>
			<Button
				v-else
				:disabled="disabled"
				variant="secondary"
				title="Commande /unbannick"
				@click="unban_nick_handler"
			>
				Débannir pseudo
			</Button>
		</li>

		<li
			v-if="
				is_current_client_member_global_operator ||
				is_current_client_member_have_vip
			"
			class="[ flex ]"
		>
			<ChannelUserlistOwnerMenu
				:disabled="disabled"
				:is-same-member="is_same_member"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="set_access_level_handler"
				@unset-access-level="unset_access_level_handler"
			/>
			<ChannelUserlistAdminOperatorMenu
				:disabled="disabled"
				:is-same-member="is_same_member"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="set_access_level_handler"
				@unset-access-level="unset_access_level_handler"
			/>
			<ChannelUserlistOperatorMenu
				:disabled="disabled"
				:is-same-member="is_same_member"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="set_access_level_handler"
				@unset-access-level="unset_access_level_handler"
			/>
			<ChannelUserlistHalfOperatorMenu
				:disabled="disabled"
				:is-same-member="is_same_member"
				:current-client-member="currentClientMember"
				:selected-member="selectedMember"
				@set-access-level="set_access_level_handler"
				@unset-access-level="unset_access_level_handler"
			/>
		</li>

		<li v-if="!is_same_member" title="TODO">
			<Button
				disabled
				icon="report"
				icon-position="right"
				:with-opacity="true"
				variant="danger"
			>
				Signaler
			</Button>
		</li>
	</menu>
</template>

<style lang="scss">
@use "@phisyx/flexsheets" as fx;

@include fx.class("room/userlist:menu") {
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

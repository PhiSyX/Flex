<script setup lang="ts">
import type { ChannelMember, ChannelMemberSelected } from "@phisyx/flex-chat";

import { computed } from "vue";

import { ChannelAccessLevelFlag } from "@phisyx/flex-chat";
import { UiButton } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props
{
	disabled?: boolean;
	isSameMember: boolean;
	currentClientMember: ChannelMember;
	selectedMember: ChannelMemberSelected;
}

interface Emits
{
	(
		event_name: "set-access-level",
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	): void;
	(
		event_name: "unset-access-level",
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { disabled: false });
const emit = defineEmits<Emits>();

let is_current_client_member_global_operator = computed(() =>
	props.currentClientMember.is_global_operator(),
);

let is_current_client_member_half_operator = computed(() =>
	props.currentClientMember.access_level.eq(
		ChannelAccessLevelFlag.HalfOperator,
	),
);

let is_current_client_member_have_operator_rights = computed(() =>
	props.currentClientMember.access_level.ge(ChannelAccessLevelFlag.Operator),
);
let is_current_client_member_have_half_operator_rights = computed(() =>
	props.currentClientMember.access_level.ge(
		ChannelAccessLevelFlag.HalfOperator,
	),
);

let is_selected_member_half_operator = computed(() =>
	props.selectedMember.member.access_level.eq(
		ChannelAccessLevelFlag.HalfOperator,
	),
);
let is_selected_member_vip_rights = computed(() =>
	props.selectedMember.member.access_level.eq(ChannelAccessLevelFlag.Vip),
);

// ------- //
// Handler //
// ------- //

const set_access_level_handler = (access_level: ChannelAccessLevelFlag) =>
	emit("set-access-level", props.selectedMember.member, access_level);
const unset_access_level_handler = (access_level: ChannelAccessLevelFlag) =>
	emit("unset-access-level", props.selectedMember.member, access_level);
</script>

<template>
	<template v-if="isSameMember && is_current_client_member_half_operator">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.HalfOperator)"
		>
			-h
		</UiButton>
	</template>

	<template
		v-if="
			is_current_client_member_have_operator_rights ||
			is_current_client_member_global_operator
		"
	>
		<UiButton
			v-if="!is_selected_member_half_operator"
			:disabled="disabled"
			variant="secondary"
			class="is-half-operator"
			title="Commande /hop"
			@click="set_access_level_handler(ChannelAccessLevelFlag.HalfOperator)"
		>
			+h
		</UiButton>
		<UiButton
			v-else-if="!isSameMember"
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.HalfOperator)"
		>
			-h
		</UiButton>
	</template>
	<template
		v-if="
			is_current_client_member_have_half_operator_rights ||
			is_current_client_member_global_operator
		"
	>
		<UiButton
			v-if="!is_selected_member_vip_rights"
			:disabled="disabled"
			variant="secondary"
			class="is-vip"
			title="Commande /vip"
			@click="set_access_level_handler(ChannelAccessLevelFlag.Vip)"
		>
			+v
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /devip"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.Vip)"
		>
			-v
		</UiButton>
	</template>
</template>

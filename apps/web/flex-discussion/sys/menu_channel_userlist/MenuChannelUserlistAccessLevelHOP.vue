<script setup lang="ts">
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelMemberSelected } from "@phisyx/flex-chat/channel/member/selected";

import { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import { computed } from "vue";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";

// ---- //
// Type //
// ---- //

interface Props {
	disabled?: boolean;
	isSameMember: boolean;
	currentClientMember: ChannelMember;
	selectedMember: ChannelMemberSelected;
}

interface Emits {
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
		<Button
			:disabled="disabled"
			appearance="secondary"
			title="Commande /dehop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.HalfOperator)"
		>
			-h
		</Button>
	</template>

	<template
		v-if="
			is_current_client_member_have_operator_rights ||
			is_current_client_member_global_operator
		"
	>
		<Button
			v-if="!is_selected_member_half_operator"
			:disabled="disabled"
			appearance="secondary"
			class="is-half-operator"
			title="Commande /hop"
			@click="set_access_level_handler(ChannelAccessLevelFlag.HalfOperator)"
		>
			+h
		</Button>
		<Button
			v-else-if="!isSameMember"
			:disabled="disabled"
			appearance="secondary"
			title="Commande /dehop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.HalfOperator)"
		>
			-h
		</Button>
	</template>
	<template
		v-if="
			is_current_client_member_have_half_operator_rights ||
			is_current_client_member_global_operator
		"
	>
		<Button
			v-if="!is_selected_member_vip_rights"
			:disabled="disabled"
			appearance="secondary"
			class="is-vip"
			title="Commande /vip"
			@click="set_access_level_handler(ChannelAccessLevelFlag.Vip)"
		>
			+v
		</Button>
		<Button
			v-else
			:disabled="disabled"
			appearance="secondary"
			title="Commande /devip"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.Vip)"
		>
			-v
		</Button>
	</template>
</template>

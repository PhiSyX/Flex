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
let is_current_client_member_operator = computed(() =>
	props.currentClientMember.access_level.eq(ChannelAccessLevelFlag.Operator),
);
let is_current_client_member_have_operator_rights = computed(() =>
	props.currentClientMember.access_level.ge(ChannelAccessLevelFlag.Operator),
);

let is_selected_member_operator = computed(() =>
	props.selectedMember.member.access_level.eq(
		ChannelAccessLevelFlag.Operator,
	),
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
	<template v-if="isSameMember && is_current_client_member_operator">
		<Button
			:disabled="disabled"
			variant="secondary"
			title="Commande /deop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.Operator)"
		>
			-o
		</Button>
	</template>
	<template
		v-else-if="
			is_current_client_member_have_operator_rights ||
			is_current_client_member_global_operator
		"
	>
		<Button
			v-if="!is_selected_member_operator"
			:disabled="disabled"
			variant="secondary"
			class="is-operator"
			title="Commande /op"
			@click="set_access_level_handler(ChannelAccessLevelFlag.Operator)"
		>
			+o
		</Button>
		<Button
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /deop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.Operator)"
		>
			-o
		</Button>
	</template>
</template>

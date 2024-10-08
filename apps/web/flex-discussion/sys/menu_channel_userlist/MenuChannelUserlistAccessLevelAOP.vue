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
let is_current_client_member_owner = computed(() =>
	props.currentClientMember.access_level.eq(ChannelAccessLevelFlag.Owner),
);
let is_current_client_member_admin = computed(() =>
	props.currentClientMember.access_level.eq(
		ChannelAccessLevelFlag.AdminOperator,
	),
);
let is_selected_member_admin = computed(() =>
	props.selectedMember.member.access_level.eq(
		ChannelAccessLevelFlag.AdminOperator,
	),
);

// ------- //
// Handler //
// ------- //

const set_access_level_handler = (flag: ChannelAccessLevelFlag) =>
	emit("set-access-level", props.selectedMember.member, flag);
const unset_access_level_handler = (flag: ChannelAccessLevelFlag) =>
	emit("unset-access-level", props.selectedMember.member, flag);
</script>

<template>
	<template v-if="isSameMember && is_current_client_member_admin">
		<Button
			:disabled="disabled"
			class="btn/secondary"
			title="Commande /deaop"
			@click="
				unset_access_level_handler(ChannelAccessLevelFlag.AdminOperator)
			"
		>
			-a
		</Button>
	</template>
	<template
		v-else-if="
			is_current_client_member_owner ||
			is_current_client_member_global_operator
		"
	>
		<Button
			v-if="!is_selected_member_admin"
			:disabled="disabled"
			class="btn/secondary is-admin-operator"
			title="Commande /aop"
			@click="
				set_access_level_handler(ChannelAccessLevelFlag.AdminOperator)
			"
		>
			+a
		</Button>
		<Button
			v-else
			:disabled="disabled"
			class="btn/secondary"
			title="Commande /deaop"
			@click="
				unset_access_level_handler(ChannelAccessLevelFlag.AdminOperator)
			"
		>
			-a
		</Button>
	</template>
</template>

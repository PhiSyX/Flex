<script setup lang="ts">
import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { ChannelMemberSelected } from "@phisyx/flex-chat/channel/member/selected";

import { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import { computed } from "vue";

import { UiButton } from "@phisyx/flex-vue-uikit";

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
let is_selected_member_owner = computed(() =>
	props.selectedMember.member.access_level.eq(ChannelAccessLevelFlag.Owner),
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
	<template v-if="isSameMember && is_current_client_member_owner">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /deqop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.Owner)"
		>
			-q
		</UiButton>
	</template>
	<template
		v-else-if="
			is_current_client_member_owner || is_current_client_member_global_operator
		"
	>
		<UiButton
			v-if="!is_selected_member_owner"
			:disabled="disabled"
			variant="secondary"
			class="is-owner"
			title="Commande /qop"
			@click="set_access_level_handler(ChannelAccessLevelFlag.Owner)"
		>
			+q
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /deqop"
			@click="unset_access_level_handler(ChannelAccessLevelFlag.Owner)"
		>
			-q
		</UiButton>
	</template>
</template>

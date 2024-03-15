<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import type { ChannelMember } from "~/channel/ChannelMember";
import type { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";

import { ChannelAccessLevelFlag } from "~/channel/ChannelAccessLevel";

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
	(evtName: "set-access-level", member: ChannelMember, accessLevel: ChannelAccessLevelFlag): void;
	(evtName: "unset-access-level", member: ChannelMember, accessLevel: ChannelAccessLevelFlag): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { disabled: false });
const emit = defineEmits<Emits>();

const isCurrentClientMemberGlobalOperator = computed(() =>
	props.currentClientMember.isGlobalOperator(),
);
const isCurrentClientMemberOwner = computed(() =>
	props.currentClientMember.accessLevel.eq(ChannelAccessLevelFlag.Owner),
);
const isCurrentClientMemberAdmin = computed(() =>
	props.currentClientMember.accessLevel.eq(ChannelAccessLevelFlag.AdminOperator),
);
const isSelectedMemberAdmin = computed(() =>
	props.selectedMember.member.accessLevel.eq(ChannelAccessLevelFlag.AdminOperator),
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("set-access-level", props.selectedMember.member, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("unset-access-level", props.selectedMember.member, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberAdmin">
		<UiButton
			:disabled="disabled"
			class="btn/secondary"
			title="Commande /deaop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.AdminOperator)"
		>
			-a
		</UiButton>
	</template>
	<template
		v-else-if="
			isCurrentClientMemberOwner || isCurrentClientMemberGlobalOperator
		"
	>
		<UiButton
			v-if="!isSelectedMemberAdmin"
			:disabled="disabled"
			class="btn/secondary is-admin-operator"
			title="Commande /aop"
			@click="setAccessLevelHandler(ChannelAccessLevelFlag.AdminOperator)"
		>
			+a
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			class="btn/secondary"
			title="Commande /deaop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.AdminOperator)"
		>
			-a
		</UiButton>
	</template>
</template>

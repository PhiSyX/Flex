<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import type { ChannelMember } from "~/channel/member";
import type { ChannelMemberSelected } from "~/channel/member/selected";

import { ChannelAccessLevelFlag } from "~/channel/access_level";

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
		evtName: "set-access-level",
		member: ChannelMember,
		accessLevel: ChannelAccessLevelFlag,
	): void;
	(
		evtName: "unset-access-level",
		member: ChannelMember,
		accessLevel: ChannelAccessLevelFlag,
	): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { disabled: false });
const emit = defineEmits<Emits>();

const isCurrentClientMemberGlobalOperator = computed(() =>
	props.currentClientMember.isGlobalOperator(),
);
const isCurrentClientMemberOperator = computed(() =>
	props.currentClientMember.accessLevel.eq(ChannelAccessLevelFlag.Operator),
);
const isCurrentClientMemberHaveOperatorRights = computed(
	() =>
		props.currentClientMember.accessLevel.highest.level >=
		ChannelAccessLevelFlag.Operator,
);

const isSelectedMemberOperator = computed(() =>
	props.selectedMember.member.accessLevel.eq(ChannelAccessLevelFlag.Operator),
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("set-access-level", props.selectedMember.member, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("unset-access-level", props.selectedMember.member, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberOperator">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /deop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.Operator)"
		>
			-o
		</UiButton>
	</template>
	<template
		v-else-if="
			isCurrentClientMemberHaveOperatorRights ||
			isCurrentClientMemberGlobalOperator
		"
	>
		<UiButton
			v-if="!isSelectedMemberOperator"
			:disabled="disabled"
			variant="secondary"
			class="is-operator"
			title="Commande /op"
			@click="setAccessLevelHandler(ChannelAccessLevelFlag.Operator)"
		>
			+o
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /deop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.Operator)"
		>
			-o
		</UiButton>
	</template>
</template>

<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import type { ChannelMember } from "~/channel/ChannelMember";
import type { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";

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
	(evtName: "set-access-level", member: ChannelMember, accessLevel: ChannelAccessLevel): void;
	(evtName: "unset-access-level", member: ChannelMember, accessLevel: ChannelAccessLevel): void;
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
	props.currentClientMember.accessLevel.has(ChannelAccessLevel.Operator),
);
const isCurrentClientMemberHaveOperatorRights = computed(
	() => props.currentClientMember.highestAccessLevel.level >= ChannelAccessLevel.Operator,
);

const isSelectedMemberOperator = computed(() =>
	props.selectedMember.member.accessLevel.has(ChannelAccessLevel.Operator),
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("set-access-level", props.selectedMember.member, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("unset-access-level", props.selectedMember.member, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberOperator">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /deop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.Operator)"
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
			@click="setAccessLevelHandler(ChannelAccessLevel.Operator)"
		>
			+o
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /deop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.Operator)"
		>
			-o
		</UiButton>
	</template>
</template>

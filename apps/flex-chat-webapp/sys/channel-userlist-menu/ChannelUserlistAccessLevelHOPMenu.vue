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

const isCurrentClientMemberHalfOperator = computed(() =>
	props.currentClientMember.accessLevel.eq(ChannelAccessLevelFlag.HalfOperator),
);

const isCurrentClientMemberHaveOperatorRights = computed(() =>
	props.currentClientMember.accessLevel.ge(ChannelAccessLevelFlag.Operator),
);
const isCurrentClientMemberHaveHalfOperatorRights = computed(() =>
	props.currentClientMember.accessLevel.ge(ChannelAccessLevelFlag.HalfOperator),
);

const isSelectedMemberHalfOperator = computed(() =>
	props.selectedMember.member.accessLevel.eq(ChannelAccessLevelFlag.HalfOperator),
);
const isSelectedMemberVipRights = computed(() =>
	props.selectedMember.member.accessLevel.eq(ChannelAccessLevelFlag.Vip),
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("set-access-level", props.selectedMember.member, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("unset-access-level", props.selectedMember.member, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberHalfOperator">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.HalfOperator)"
		>
			-h
		</UiButton>
	</template>

	<template
		v-if="
			isCurrentClientMemberHaveOperatorRights ||
			isCurrentClientMemberGlobalOperator
		"
	>
		<UiButton
			v-if="!isSelectedMemberHalfOperator"
			:disabled="disabled"
			variant="secondary"
			class="is-half-operator"
			title="Commande /hop"
			@click="setAccessLevelHandler(ChannelAccessLevelFlag.HalfOperator)"
		>
			+h
		</UiButton>
		<UiButton
			v-else-if="!isSameMember"
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.HalfOperator)"
		>
			-h
		</UiButton>
	</template>
	<template
		v-if="
			isCurrentClientMemberHaveHalfOperatorRights ||
			isCurrentClientMemberGlobalOperator
		"
	>
		<UiButton
			v-if="!isSelectedMemberVipRights"
			:disabled="disabled"
			variant="secondary"
			class="is-vip"
			title="Commande /vip"
			@click="setAccessLevelHandler(ChannelAccessLevelFlag.Vip)"
		>
			+v
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /devip"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.Vip)"
		>
			-v
		</UiButton>
	</template>
</template>

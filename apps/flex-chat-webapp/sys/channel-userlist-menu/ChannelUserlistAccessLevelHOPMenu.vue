<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";

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
		accessLevel: ChannelAccessLevel
	): void;
	(
		evtName: "unset-access-level",
		member: ChannelMember,
		accessLevel: ChannelAccessLevel
	): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { disabled: false });
const emit = defineEmits<Emits>();

const isCurrentClientMemberGlobalOperator = computed(() =>
	props.currentClientMember.isGlobalOperator()
);

const isCurrentClientMemberHalfOperator = computed(() =>
	props.currentClientMember.accessLevel.has(ChannelAccessLevel.HalfOperator)
);

const isCurrentClientMemberHaveOperatorRights = computed(
	() =>
		props.currentClientMember.highestAccessLevel.level >=
		ChannelAccessLevel.Operator
);
const isCurrentClientMemberHaveHalfOperatorRights = computed(
	() =>
		props.currentClientMember.highestAccessLevel.level >=
		ChannelAccessLevel.HalfOperator
);

const isSelectedMemberHalfOperator = computed(() =>
	props.selectedMember.member.accessLevel.has(ChannelAccessLevel.HalfOperator)
);
const isSelectedMemberVipRights = computed(() =>
	props.selectedMember.member.accessLevel.has(ChannelAccessLevel.Vip)
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("set-access-level", props.selectedMember.member, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("unset-access-level", props.selectedMember.member, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberHalfOperator">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.HalfOperator)"
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
			@click="setAccessLevelHandler(ChannelAccessLevel.HalfOperator)"
		>
			+h
		</UiButton>
		<UiButton
			v-else-if="!isSameMember"
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.HalfOperator)"
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
			@click="setAccessLevelHandler(ChannelAccessLevel.Vip)"
		>
			+v
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /devip"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.Vip)"
		>
			-v
		</UiButton>
	</template>
</template>

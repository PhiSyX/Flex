<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";
import { UserFlag } from "~/user/User";

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
		cnick: ChannelMember,
		accessLevel: ChannelAccessLevel
	): void;
	(
		evtName: "unset-access-level",
		cnick: ChannelMember,
		accessLevel: ChannelAccessLevel
	): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { disabled: false });
const emit = defineEmits<Emits>();

const isCurrentClientMemberGlobalOperator = computed(() =>
	props.currentClientMember
		.intoUser()
		.operator.filter((flag) => flag === UserFlag.GlobalOperator)
		.is_some()
);
const isCurrentClientMemberOwner = computed(() =>
	props.currentClientMember.accessLevel.has(ChannelAccessLevel.Owner)
);
const isCurrentClientMemberAdmin = computed(() =>
	props.currentClientMember.accessLevel.has(ChannelAccessLevel.AdminOperator)
);

const isSelectedMemberAdmin = computed(() =>
	props.selectedMember.cnick.accessLevel.has(ChannelAccessLevel.AdminOperator)
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("set-access-level", props.selectedMember.cnick, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("unset-access-level", props.selectedMember.cnick, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberAdmin">
		<UiButton
			:disabled="disabled"
			class="btn/secondary"
			title="Commande /deaop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.AdminOperator)"
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
			@click="setAccessLevelHandler(ChannelAccessLevel.AdminOperator)"
		>
			+a
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			class="btn/secondary"
			title="Commande /deaop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.AdminOperator)"
		>
			-a
		</UiButton>
	</template>
</template>

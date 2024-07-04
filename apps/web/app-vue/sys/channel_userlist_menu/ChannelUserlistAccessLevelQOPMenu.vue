<script setup lang="ts">
import { UiButton } from "@phisyx/flex-vue-uikit";
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
const isCurrentClientMemberOwner = computed(() =>
	props.currentClientMember.accessLevel.eq(ChannelAccessLevelFlag.Owner),
);
const isSelectedMemberOwner = computed(() =>
	props.selectedMember.member.accessLevel.eq(ChannelAccessLevelFlag.Owner),
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("set-access-level", props.selectedMember.member, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevelFlag) =>
	emit("unset-access-level", props.selectedMember.member, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberOwner">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /deqop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.Owner)"
		>
			-q
		</UiButton>
	</template>
	<template
		v-else-if="
			isCurrentClientMemberOwner || isCurrentClientMemberGlobalOperator
		"
	>
		<UiButton
			v-if="!isSelectedMemberOwner"
			:disabled="disabled"
			variant="secondary"
			class="is-owner"
			title="Commande /qop"
			@click="setAccessLevelHandler(ChannelAccessLevelFlag.Owner)"
		>
			+q
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /deqop"
			@click="unsetAccessLevelHandler(ChannelAccessLevelFlag.Owner)"
		>
			-q
		</UiButton>
	</template>
</template>

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
const isCurrentClientMemberOwner = computed(() =>
	props.currentClientMember.accessLevel.has(ChannelAccessLevel.Owner),
);

const isSelectedMemberOwner = computed(() =>
	props.selectedMember.member.accessLevel.has(ChannelAccessLevel.Owner),
);

const setAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("set-access-level", props.selectedMember.member, accessLevel);
const unsetAccessLevelHandler = (accessLevel: ChannelAccessLevel) =>
	emit("unset-access-level", props.selectedMember.member, accessLevel);
</script>

<template>
	<template v-if="isSameMember && isCurrentClientMemberOwner">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /deqop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.Owner)"
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
			@click="setAccessLevelHandler(ChannelAccessLevel.Owner)"
		>
			+q
		</UiButton>
		<UiButton
			v-else
			:disabled="disabled"
			variant="secondary"
			title="Commande /deqop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.Owner)"
		>
			-q
		</UiButton>
	</template>
</template>

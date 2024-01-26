<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";
import { computeImGlobalOperator } from "./ChannelUserlistMenu.state";

// ---- //
// Type //
// ---- //

interface Props {
	disabled?: boolean;
	isMe: boolean;
	me: ChannelNick;
	user: ChannelSelectedUser;
}

interface Emits {
	(
		evtName: "set-access-level",
		cnick: ChannelNick,
		accessLevel: ChannelAccessLevel,
	): void;
	(
		evtName: "unset-access-level",
		cnick: ChannelNick,
		accessLevel: ChannelAccessLevel,
	): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { disabled: false });
const emit = defineEmits<Emits>();

const imGlobalOperator = computeImGlobalOperator(props);
const imOperator = computed(() =>
	props.me.accessLevel.has(ChannelAccessLevel.Operator)
);
const iHaveOperatorRights = computed(
	() => props.me.highestAccessLevel.level >= ChannelAccessLevel.Operator
);
const isUserOperator = computed(() =>
	props.user.cnick.accessLevel.has(ChannelAccessLevel.Operator)
);

function setAccessLevelHandler(accessLevel: ChannelAccessLevel) {
	emit("set-access-level", props.user.cnick, accessLevel);
}

function unsetAccessLevelHandler(accessLevel: ChannelAccessLevel) {
	emit("unset-access-level", props.user.cnick, accessLevel);
}
</script>

<template>
	<template v-if="isMe && imOperator">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /deop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.Operator)"
		>
			-o
		</UiButton>
	</template>
	<template v-else-if="iHaveOperatorRights || imGlobalOperator">
		<UiButton
			v-if="!isUserOperator"
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

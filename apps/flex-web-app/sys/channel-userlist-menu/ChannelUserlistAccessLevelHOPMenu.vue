<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { computed } from "vue";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";

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
		accessLevel: ChannelAccessLevel
	): void;
	(
		evtName: "unset-access-level",
		cnick: ChannelNick,
		accessLevel: ChannelAccessLevel
	): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { disabled: false });
const emit = defineEmits<Emits>();

const imHalfOperator = computed(() =>
	props.me.accessLevel.has(ChannelAccessLevel.HalfOperator)
);

const iHaveOperatorRights = computed(
	() => props.me.highestAccessLevel.level >= ChannelAccessLevel.Operator
);
const iHaveHalfOperatorRights = computed(
	() => props.me.highestAccessLevel.level >= ChannelAccessLevel.HalfOperator
);
const isUserHalfOperator = computed(() =>
	props.user.cnick.accessLevel.has(ChannelAccessLevel.HalfOperator)
);
const isUserVipRights = computed(() =>
	props.user.cnick.accessLevel.has(ChannelAccessLevel.Vip)
);

function setAccessLevelHandler(accessLevel: ChannelAccessLevel) {
	emit("set-access-level", props.user.cnick, accessLevel);
}

function unsetAccessLevelHandler(accessLevel: ChannelAccessLevel) {
	emit("unset-access-level", props.user.cnick, accessLevel);
}
</script>

<template>
	<template v-if="isMe && imHalfOperator">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.HalfOperator)"
		>
			-h
		</UiButton>
	</template>

	<template v-if="iHaveOperatorRights">
		<UiButton
			v-if="!isUserHalfOperator"
			:disabled="disabled"
			variant="secondary"
			class="is-half-operator"
			title="Commande /hop"
			@click="setAccessLevelHandler(ChannelAccessLevel.HalfOperator)"
		>
			+h
		</UiButton>
		<UiButton
			v-else-if="!isMe"
			:disabled="disabled"
			variant="secondary"
			title="Commande /dehop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.HalfOperator)"
		>
			-h
		</UiButton>
	</template>
	<template v-if="iHaveHalfOperatorRights">
		<UiButton
			v-if="!isUserVipRights"
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

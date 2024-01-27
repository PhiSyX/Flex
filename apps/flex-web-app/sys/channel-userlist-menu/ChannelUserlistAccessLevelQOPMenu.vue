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
const imOwner = computed(() =>
	props.me.accessLevel.has(ChannelAccessLevel.Owner)
);
const isUserOwner = computed(() =>
	props.user.cnick.accessLevel.has(ChannelAccessLevel.Owner)
);

function setAccessLevelHandler(accessLevel: ChannelAccessLevel) {
	emit("set-access-level", props.user.cnick, accessLevel);
}

function unsetAccessLevelHandler(accessLevel: ChannelAccessLevel) {
	emit("unset-access-level", props.user.cnick, accessLevel);
}
</script>

<template>
	<template v-if="isMe && imOwner">
		<UiButton
			:disabled="disabled"
			variant="secondary"
			title="Commande /deqop"
			@click="unsetAccessLevelHandler(ChannelAccessLevel.Owner)"
		>
			-q
		</UiButton>
	</template>
	<template v-else-if="imOwner || imGlobalOperator">
		<UiButton
			v-if="!isUserOwner"
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

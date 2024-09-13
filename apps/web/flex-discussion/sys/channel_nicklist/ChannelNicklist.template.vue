<script setup lang="ts">
import type { ChannelMember, ChannelMemberUnfiltered } from "@phisyx/flex-chat";

import { computed } from "vue";

import { ChannelMemberFiltered } from "@phisyx/flex-chat";

import ChannelNicklistItem from "#/sys/channel_nicklist/ChannelNicklistItem.vue";

// ---- //
// Type //
// ---- //

interface Props {
	filterInput: string;
	moderators: {
		original: Array<ChannelMember>;
		filtered: Array<ChannelMemberFiltered | ChannelMemberUnfiltered>;
	};
	vips: {
		original: Array<ChannelMember>;
		filtered: Array<ChannelMemberFiltered | ChannelMemberUnfiltered>;
	};
	users: {
		original: Array<ChannelMember>;
		filtered: Array<ChannelMemberFiltered | ChannelMemberUnfiltered>;
	};
	useIconInsteadOfAvatar?: boolean;
}

interface Emits {
	(event_name: "open-private", origin: Origin): void;
	(event_name: "select-member", origin: Origin): void;
}

interface Slots {
	"user-info": (_: { member: ChannelMember }) => unknown;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

let moderators_list = computed<
	Array<ChannelMember | ChannelMemberFiltered | ChannelMemberUnfiltered>
>(() =>
	props.moderators.filtered.length > 0
		? props.moderators.filtered
		: props.moderators.original,
);

let vips_list = computed<
	Array<ChannelMember | ChannelMemberFiltered | ChannelMemberUnfiltered>
>(() =>
	props.vips.filtered.length > 0 ? props.vips.filtered : props.vips.original,
);

let users_list = computed<
	Array<ChannelMember | ChannelMemberFiltered | ChannelMemberUnfiltered>
>(() =>
	props.users.filtered.length > 0
		? props.users.filtered
		: props.users.original,
);

let has_filtered_moderators = computed(() =>
	props.moderators.filtered.some(
		(member) => member instanceof ChannelMemberFiltered,
	),
);
let has_filtered_vips = computed(() =>
	props.vips.filtered.some(
		(member) => member instanceof ChannelMemberFiltered,
	),
);
let has_filtered_users = computed(() =>
	props.users.filtered.some(
		(member) => member instanceof ChannelMemberFiltered,
	),
);

let has_filters = computed(
	() =>
		has_filtered_moderators.value ||
		has_filtered_vips.value ||
		has_filtered_users.value,
);

// -------- //
// Handlers //
// -------- //

const open_private_handler = (member: Origin) => emit("open-private", member);
const select_user_handler = (member: Origin) => emit("select-member", member);
</script>

<template>
	<fieldset class="[ scroll:y flex! gap=3 p=2 select:none ]">
		<legend
			:class="{
				'vis:h': filterInput.length === 0 || has_filters,
			}"
			class="[ f-size=12px ]"
		>
			Aucun résultat
		</legend>

		<ChannelNicklistItem
			v-if="moderators.original.length > 0"
			:list="moderators_list"
			:open="moderators_list.length > 0"
			:use-icon-instead-of-avatar="useIconInsteadOfAvatar"
			title="Modérateurs"
			@open-private="open_private_handler"
			@select-member="select_user_handler"
		>
			<template #user-info="{ member }">
				<slot name="user-info" :member="member" />
			</template>
		</ChannelNicklistItem>

		<ChannelNicklistItem
			v-if="vips.original.length > 0"
			:list="vips_list"
			:open="vips_list.length > 0"
			:use-icon-instead-of-avatar="useIconInsteadOfAvatar"
			title="VIP"
			@open-private="open_private_handler"
			@select-member="select_user_handler"
		>
			<template #user-info="{ member }">
				<slot name="user-info" :member="member" />
			</template>
		</ChannelNicklistItem>

		<ChannelNicklistItem
			v-if="users.original.length > 0"
			:list="users_list"
			:open="users_list.length > 0"
			:use-icon-instead-of-avatar="useIconInsteadOfAvatar"
			title="Utilisateurs"
			@open-private="open_private_handler"
			@select-member="select_user_handler"
		>
			<template #user-info="{ member }">
				<slot name="user-info" :member="member" />
			</template>
		</ChannelNicklistItem>
	</fieldset>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

fieldset {
	border: none;
}

legend {
	color: var(--color-red300);
}
</style>

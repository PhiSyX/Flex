<script setup lang="ts">
import type { ChannelMember, ChannelMembers } from "@phisyx/flex-chat";

import { UiButton } from "@phisyx/flex-vue-uikit";

import {
	UserlistModeView,
	use_filter_view,
	use_inputfilter_userlist,
} from "./ChannelUserlist.hooks";

// ---- //
// Type //
// ---- //

export interface Props
{
	name: string;
	members: ChannelMembers;
	useIconInsteadOfAvatar?: boolean;
}

interface Emits
{
	(event_name: "open-private", origin: Origin): void;
	(event_name: "select-member", origin: Origin): void;
}

interface Slots
{
	"user-info": (_: { member: ChannelMember }) => unknown;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

const { filter_nick, moderators_filtered, vips_filtered, users_filtered } =
	use_inputfilter_userlist(props);

const { filter_view, view } = use_filter_view();

// ------- //
// Handler //
// ------- //

const open_private_handler = (origin: Origin) => emit("open-private", origin);
const select_channel_member_handler = (origin: Origin) =>
	emit("select-member", origin);
</script>

<template>
	<div class="room/userlist [ flex! gap=1 ]">
		<input
			v-model="filter_nick"
			:placeholder="`${name} &ndash; filtrer les ${members.size} utilisateurs`"
			class="[ input:reset mx=1 p=1 ]"
			maxlength="30"
		/>

		<div class="room/userlist:filter-view [ flex flex/center:full gap=1 ]">
			<UiButton
				v-model:selected="filter_view"
				:value="UserlistModeView.Default"
				icon="view-list"
			/>
		</div>

		<KeepAlive>
			<component
				:is="view"
				:filter-input="filter_nick"
				:moderators="{
					original: members.moderators,
					filtered: moderators_filtered,
				}"
				:vips="{
					original: members.vips,
					filtered: vips_filtered,
				}"
				:users="{
					original: members.users,
					filtered: users_filtered,
				}"
				:use-icon-instead-of-avatar="useIconInsteadOfAvatar"
				@open-private="open_private_handler"
				@select-member="select_channel_member_handler"
			>
				<template #user-info="{ member }">
					<slot name="user-info" :member="member" />
				</template>
			</component>
		</KeepAlive>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/userlist") {
	background-color: var(--room-userlist-bg);
	color: inherit;
}

input {
	transition: border-color 200ms;
	border: 2px solid transparent;
	border-radius: 4px;
	background-color: var(--room-userlist-search-bg);
	color: inherit;
	&:focus {
		border-color: var(--room-userlist-search-outline-focus);
	}
}
</style>

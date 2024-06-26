<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";

import type { ChannelMembers } from "~/channel/member/list";

import {
	UserlistModeView,
	useFilterView,
	useInputFilterUserlist,
} from "./ChannelUserlist.hooks";

// ---- //
// Type //
// ---- //

export interface Props {
	name: string;
	members: ChannelMembers;
}

interface Emits {
	(evtName: "open-private", origin: Origin): void;
	(evtName: "select-member", origin: Origin): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { filterNick, moderatorsFiltered, vipsFiltered, usersFiltered } =
	useInputFilterUserlist(props);

const { filterView, view } = useFilterView();

const openPrivate = (origin: Origin) => emit("open-private", origin);
const selectChannelMember = (origin: Origin) => emit("select-member", origin);
</script>

<template>
	<div class="room/userlist [ flex! gap=1 ]">
		<input
			v-model="filterNick"
			:placeholder="`${name} &ndash; filtrer les ${members.size} utilisateurs`"
			class="[ input:reset mx=1 p=1 ]"
			maxlength="30"
		/>

		<div class="room/userlist:filter-view [ flex flex/center:full gap=1 ]">
			<UiButton
				v-model:selected="filterView"
				:value="UserlistModeView.Default"
				icon="view-list"
			/>
		</div>

		<KeepAlive>
			<component
				:is="view"
				:filter-input="filterNick"
				:moderators="{
					original: members.moderators,
					filtered: moderatorsFiltered,
				}"
				:vips="{
					original: members.vips,
					filtered: vipsFiltered,
				}"
				:users="{
					original: members.users,
					filtered: usersFiltered,
				}"
				@open-private="openPrivate"
				@select-member="selectChannelMember"
			/>
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

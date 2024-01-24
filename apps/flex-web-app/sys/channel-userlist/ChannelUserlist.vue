<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";

import { Props, UserlistModeView } from "./ChannelUserlist.state";
import { useFilterView, useInputFilterUserlist } from "./ChannelUserlist.hooks";

import {
	type Emits,
	openPrivate,
	selectUser,
} from "./ChannelUserlist.handlers";

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { filterNick, moderatorsFiltered, vipsFiltered, usersFiltered } =
	useInputFilterUserlist(props);

const { filterView, view } = useFilterView();

const openPrivateHandler = openPrivate(emit);
const selectUserHandler = selectUser(emit);
</script>

<template>
	<div class="room/userlist [ flex! gap=1 ]">
		<input
			v-model="filterNick"
			:placeholder="`${name} &ndash; filtrer les ${users.size} utilisateurs`"
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
				:moderators="{
					original: users.moderators,
					filtered: moderatorsFiltered,
				}"
				:vips="{
					original: users.vips,
					filtered: vipsFiltered,
				}"
				:users="{
					original: users.users,
					filtered: usersFiltered,
				}"
				@open-private="openPrivateHandler"
				@select-user="selectUserHandler"
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

<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";

import { Props, UserlistModeView } from "./ChannelUserlist.state";
import { useFilterView, useInputFilterUserlist } from "./ChannelUserlist.hooks";

import { type Emits, openPrivate } from "./ChannelUserlist.handlers";

// --------- //
// Composant //
// --------- //
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { filterNick, moderatorsFiltered, vipsFiltered, usersFiltered } =
	useInputFilterUserlist(props);

const { filterView, view } = useFilterView();

const openPrivateHandler = openPrivate(emit);
</script>

<template>
	<div class="room/userlist">
		<input
			v-model="filterNick"
			:placeholder="`${name} &ndash; filtrer les ${users.size} utilisateurs`"
			class="[ input:reset ]"
			maxlength="30"
		/>

		<div class="room/userlist:filter-view">
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
			/>
		</KeepAlive>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/userlist") {
	display: flex;
	flex-direction: column;
	gap: fx.space(1);

	background-color: var(--room-userlist-bg);
	color: inherit;
}

input {
	margin-inline: fx.space(1);
	padding: fx.space(1);
	transition: border-color 200ms;
	border: 2px solid transparent;
	border-radius: 4px;
	background-color: var(--room-userlist-search-bg);
	color: inherit;
	&:focus {
		border-color: var(--room-userlist-search-outline-focus);
	}
}

@include fx.class("room/userlist:filter-view") {
	display: flex;
	place-content: center;
	place-items: center;
	gap: fx.space(1);
}
</style>

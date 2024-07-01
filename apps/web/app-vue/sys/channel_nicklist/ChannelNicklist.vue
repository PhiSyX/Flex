<script setup lang="ts">
import { computed } from "vue";

import type { ChannelMember } from "~/channel/member";
import {
	ChannelMemberFiltered,
	type ChannelMemberUnfiltered,
} from "~/channel/member/filtered";

import ChannelNickComponent from "#/sys/channel_nick/ChannelNick.vue";

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

const channelMemberTitleAttr = computed(() => {
	return (
		"· Simple clique: ouvrir le menu du membre du salon... \n" +
		"· Double clique: ouvrir la discussion privé avec le membre du salon\n"
	);
});

const moderatorsList = computed<
	Array<ChannelMember | ChannelMemberFiltered | ChannelMemberUnfiltered>
>(() => {
	return props.moderators.filtered.length > 0
		? props.moderators.filtered
		: props.moderators.original;
});

const vipsList = computed<
	Array<ChannelMember | ChannelMemberFiltered | ChannelMemberUnfiltered>
>(() => {
	return props.vips.filtered.length > 0
		? props.vips.filtered
		: props.vips.original;
});

const usersList = computed<
	Array<ChannelMember | ChannelMemberFiltered | ChannelMemberUnfiltered>
>(() => {
	return props.users.filtered.length > 0
		? props.users.filtered
		: props.users.original;
});

const hasFilteredModerators = computed(() => {
	return props.moderators.filtered.some(
		(member) => member instanceof ChannelMemberFiltered,
	);
});
const hasFilteredVips = computed(() => {
	return props.vips.filtered.some(
		(member) => member instanceof ChannelMemberFiltered,
	);
});
const hasFilteredUsers = computed(() => {
	return props.users.filtered.some(
		(member) => member instanceof ChannelMemberFiltered,
	);
});

const hasFilters = computed(() => {
	return (
		hasFilteredModerators.value ||
		hasFilteredVips.value ||
		hasFilteredUsers.value
	);
});

// -------- //
// Handlers //
// -------- //

function openPrivateHandler(member: ChannelMember) {
	emit("open-private", member);
}

function selectUserHandler(member: ChannelMember) {
	emit("select-member", member);
}
</script>

<template>
	<fieldset class="[ scroll:y flex! gap=3 p=2 select:none ]">
		<legend
			:class="{
				'vis-h': filterInput.length === 0 || hasFilters,
			}"
		>
			Aucun résultat
		</legend>

		<details
			v-if="moderators.original.length > 0"
			:open="moderatorsList.length > 0"
		>
			<summary>Modérateurs</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filteredMember in moderatorsList"
					:key="filteredMember.id"
					:classes="filteredMember.className"
					:hits="
						'searchHits' in filteredMember
							? filteredMember.searchHits
							: []
					"
					:is-current-client="filteredMember.isCurrentClient"
					:nickname="filteredMember.nickname"
					:symbol="filteredMember.accessLevel.highest.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredMember)"
					@click="selectUserHandler(filteredMember)"
					:title="channelMemberTitleAttr"
				/>
			</ul>
		</details>

		<details v-if="vips.original.length > 0" :open="vipsList.length > 0">
			<summary>VIP</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filteredMember in vipsList"
					:key="filteredMember.id"
					:classes="filteredMember.className"
					:hits="
						'searchHits' in filteredMember
							? filteredMember.searchHits
							: []
					"
					:is-current-client="filteredMember.isCurrentClient"
					:nickname="filteredMember.nickname"
					:symbol="filteredMember.accessLevel.highest.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredMember)"
					@click="selectUserHandler(filteredMember)"
				/>
			</ul>
		</details>

		<details v-if="users.original.length > 0" :open="usersList.length > 0">
			<summary>Utilisateurs</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filteredMember in usersList"
					:key="filteredMember.id"
					:classes="filteredMember.className"
					:hits="
						'searchHits' in filteredMember
							? filteredMember.searchHits
							: []
					"
					:is-current-client="filteredMember.isCurrentClient"
					:nickname="filteredMember.nickname"
					:symbol="filteredMember.accessLevel.highest.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredMember)"
					@click="selectUserHandler(filteredMember)"
				/>
			</ul>
		</details>
	</fieldset>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

.vis-h {
	visibility: hidden;
}

fieldset {
	border: none;
}

legend {
	color: var(--color-red300);
	font-size: 12px;
}

details {
	position: sticky;
}

details[open] > summary {
	margin-bottom: fx.space(3);
}

summary {
	font-size: 15px;

	list-style-type: none;
	text-transform: uppercase;

	color: var(--room-userlist-group-color);
}

ul {
	display: flex;
	flex-direction: column;
	gap: fx.space(2);
	font-size: 14px;
}

@include fx.class("channel/nick") {
	padding: fx.space(1);
	padding-inline: 4px;
	border-radius: 4px;
}
</style>

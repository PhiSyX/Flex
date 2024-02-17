<script setup lang="ts">
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelMemberFiltered } from "~/channel/ChannelMemberFiltered";

import ChannelNickComponent from "#/sys/channel-nick/ChannelNick.vue";
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	moderators: {
		original: Array<ChannelMember>;
		filtered: Array<ChannelMemberFiltered>;
	};
	vips: {
		original: Array<ChannelMember>;
		filtered: Array<ChannelMemberFiltered>;
	};
	users: {
		original: Array<ChannelMember>;
		filtered: Array<ChannelMemberFiltered>;
	};
}

interface Emits {
	(evtName: "open-private", origin: Origin): void;
	(evtName: "select-member", origin: Origin): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const channelMemberTitleAttr = computed(() => {
	return (
		"· Simple clique: ouvrir le menu du membre du salon... \n" +
		"· Double clique: ouvrir la discussion privé avec le membre du salon\n"
	);
});

// -------- //
// Handlers //
// -------- //

function openPrivateHandler(member: ChannelMemberFiltered) {
	emit("open-private", member.member.intoUser());
}

function selectUserHandler(member: ChannelMemberFiltered) {
	emit("select-member", member.member.intoUser());
}
</script>

<template>
	<div class="[ scroll:y flex! gap=3 p=2 select:none ]">
		<details
			v-if="moderators.original.length > 0"
			:open="moderators.filtered.length > 0"
		>
			<summary>Modérateurs</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filteredNick in moderators.filtered"
					:key="filteredNick.member.id"
					:classes="filteredNick.member.className"
					:hits="filteredNick.searchHits"
					:is-current-client="filteredNick.member.isCurrentClient"
					:nickname="filteredNick.member.nickname"
					:symbol="filteredNick.member.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredNick)"
					@click="selectUserHandler(filteredNick)"
					:title="channelMemberTitleAttr"
				/>
			</ul>
		</details>

		<details
			v-if="vips.original.length > 0"
			:open="vips.filtered.length > 0"
		>
			<summary>VIP</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filteredNick in vips.filtered"
					:key="filteredNick.member.id"
					:classes="filteredNick.member.className"
					:hits="filteredNick.searchHits"
					:is-current-client="filteredNick.member.isCurrentClient"
					:nickname="filteredNick.member.nickname"
					:symbol="filteredNick.member.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredNick)"
					@click="selectUserHandler(filteredNick)"
				/>
			</ul>
		</details>

		<details
			v-if="users.original.length > 0"
			:open="users.filtered.length > 0"
		>
			<summary>Utilisateurs</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filteredNick in users.filtered"
					:key="filteredNick.member.id"
					:classes="filteredNick.member.className"
					:hits="filteredNick.searchHits"
					:is-current-client="filteredNick.member.isCurrentClient"
					:nickname="filteredNick.member.nickname"
					:symbol="filteredNick.member.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredNick)"
					@click="selectUserHandler(filteredNick)"
				/>
			</ul>
		</details>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

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

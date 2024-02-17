<script setup lang="ts">
import { ChannelMember } from "~/channel/ChannelMember";
import {
	ChannelMemberFiltered,
	ChannelMemberUnfiltered,
} from "~/channel/ChannelMemberFiltered";

import ChannelNickComponent from "#/sys/channel-nick/ChannelNick.vue";
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
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

function openPrivateHandler(member: ChannelMember) {
	emit("open-private", member.intoUser());
}

function selectUserHandler(member: ChannelMember) {
	emit("select-member", member.intoUser());
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
					v-for="filteredMember in moderators.filtered"
					:key="filteredMember.id"
					:classes="filteredMember.className"
					:hits="filteredMember.searchHits || []"
					:is-current-client="filteredMember.isCurrentClient"
					:nickname="filteredMember.nickname"
					:symbol="filteredMember.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredMember)"
					@click="selectUserHandler(filteredMember)"
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
					v-for="filteredMember in vips.filtered"
					:key="filteredMember.id"
					:classes="filteredMember.className"
					:hits="filteredMember.searchHits || []"
					:is-current-client="filteredMember.isCurrentClient"
					:nickname="filteredMember.nickname"
					:symbol="filteredMember.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredMember)"
					@click="selectUserHandler(filteredMember)"
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
					v-for="filteredMember in users.filtered"
					:key="filteredMember.id"
					:classes="filteredMember.className"
					:hits="filteredMember.searchHits"
					:is-current-client="filteredMember.isCurrentClient"
					:nickname="filteredMember.nickname"
					:symbol="filteredMember.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(filteredMember)"
					@click="selectUserHandler(filteredMember)"
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

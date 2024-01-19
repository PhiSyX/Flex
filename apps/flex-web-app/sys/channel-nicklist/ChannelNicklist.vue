<script setup lang="ts">
import { ChannelNick } from "~/channel/ChannelNick";

import { openPrivate, type Emits } from "./ChannelNicklist.handler";

import ChannelNickComponent from "#/sys/channel-nick/ChannelNick.vue";
import { SearchHits } from "#/sys/channel-userlist/ChannelUserlist.hooks";

// ---- //
// Type //
// ---- //

interface Props {
	moderators: {
		original: Array<ChannelNick>;
		filtered: Array<ChannelNick & { searchHits?: Array<SearchHits> }>;
	};
	vips: {
		original: Array<ChannelNick>;
		filtered: Array<ChannelNick & { searchHits?: Array<SearchHits> }>;
	};
	users: {
		original: Array<ChannelNick>;
		filtered: Array<ChannelNick & { searchHits?: Array<SearchHits> }>;
	};
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();

const openPrivateHandler = openPrivate(emit);
</script>

<template>
	<div class="[ scroll:y ]">
		<details
			v-if="moderators.original.length > 0"
			:open="moderators.filtered.length > 0"
		>
			<summary>Modérateurs</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="nick in moderators.filtered"
					:key="nick.nickname"
					:classes="nick.highestAccessLevel.className"
					:hits="nick.searchHits"
					:nickname="nick.nickname"
					:symbol="nick.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(nick.nickname)"
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
					v-for="nick in vips.filtered"
					:key="nick.nickname"
					:classes="nick.highestAccessLevel.className"
					:hits="nick.searchHits"
					:nickname="nick.nickname"
					:symbol="nick.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(nick.nickname)"
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
					v-for="nick in users.filtered"
					:key="nick.nickname"
					:classes="nick.highestAccessLevel.className"
					:hits="nick.searchHits"
					:nickname="nick.nickname"
					:symbol="nick.highestAccessLevel.symbol"
					class="channel/nick"
					@dblclick="openPrivateHandler(nick.nickname)"
				/>
			</ul>
		</details>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

div {
	display: flex;
	flex-direction: column;
	gap: fx.space(3);
	padding: fx.space(2);
	user-select: none;
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

	@include fx.theme using ($name) {
		@if $name == dark {
			--room-userlist-group-color: var(--color-yellow300);
		} @else if $name == light {
			--room-userlist-group-color: var(--color-grey400);
		}
	}

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

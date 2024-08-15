<script setup lang="ts">
import type { ChannelMember, ChannelMemberUnfiltered } from "@phisyx/flex-chat";

import { computed } from "vue";

import { ChannelMemberFiltered } from "@phisyx/flex-chat";

import ChannelNickComponent from "#/sys/channel_nick/ChannelNick.template.vue";

// ---- //
// Type //
// ---- //

interface Props
{
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

interface Emits
{
	(event_name: "open-private", origin: Origin): void;
	(event_name: "select-member", origin: Origin): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let channel_member_title_attribute = (
	"· Simple clique: ouvrir le menu du membre du salon... \n" +
	"· Double clique: ouvrir la discussion privé avec le membre du salon\n"
);

let moderators_list = computed<Array<
	| ChannelMember
	| ChannelMemberFiltered
	| ChannelMemberUnfiltered
>>(
	() => props.moderators.filtered.length > 0
		? props.moderators.filtered
		: props.moderators.original
);

let vips_list = computed<Array<
	| ChannelMember
	| ChannelMemberFiltered
	| ChannelMemberUnfiltered
>>(
	() => props.vips.filtered.length > 0
		? props.vips.filtered
		: props.vips.original
);

let users_list = computed<Array<
	| ChannelMember
	| ChannelMemberFiltered
	| ChannelMemberUnfiltered
>>(
	() => props.users.filtered.length > 0
		? props.users.filtered
		: props.users.original
);

let has_filtered_moderators = computed(() => props.moderators
	.filtered.some((member) => member instanceof ChannelMemberFiltered)
);
let has_filtered_vips = computed(() => props.vips
	.filtered.some((member) => member instanceof ChannelMemberFiltered)
);
let has_filtered_users = computed(() => props.users
	.filtered.some((member) => member instanceof ChannelMemberFiltered)
);

let has_filters = computed(() => (
	has_filtered_moderators.value ||
	has_filtered_vips.value ||
	has_filtered_users.value
));

// -------- //
// Handlers //
// -------- //

const open_private_handler = (member: ChannelMember) => emit("open-private", member);
const select_user_handler  = (member: ChannelMember) => emit("select-member", member);
</script>

<template>
	<fieldset class="[ scroll:y flex! gap=3 p=2 select:none ]">
		<legend
			:class="{
				'vis-h': filterInput.length === 0 || has_filters,
			}"
		>
			Aucun résultat
		</legend>

		<details
			v-if="moderators.original.length > 0"
			:open="moderators_list.length > 0"
		>
			<summary>Modérateurs</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filtered_member in moderators_list"
					:key="filtered_member.id"
					:id="filtered_member.id"
					:classes="filtered_member.class_name"
					:hits="
						'search_hits' in filtered_member
							? filtered_member.search_hits
							: []
					"
					:is-current-client="filtered_member.is_current_client"
					:nickname="filtered_member.nickname"
					:symbol="filtered_member.access_level.highest.symbol"
					class="channel/nick"
					@dblclick="open_private_handler(filtered_member)"
					@click="select_user_handler(filtered_member)"
					:title="channel_member_title_attribute"
				/>
			</ul>
		</details>

		<details v-if="vips.original.length > 0" :open="vips_list.length > 0">
			<summary>VIP</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filtered_member in vips_list"
					:key="filtered_member.id"
					:id="filtered_member.id"
					:classes="filtered_member.class_name"
					:hits="
						'search_hits' in filtered_member
							? filtered_member.search_hits
							: []
					"
					:is-current-client="filtered_member.is_current_client"
					:nickname="filtered_member.nickname"
					:symbol="filtered_member.access_level.highest.symbol"
					class="channel/nick"
					@dblclick="open_private_handler(filtered_member)"
					@click="select_user_handler(filtered_member)"
				/>
			</ul>
		</details>

		<details v-if="users.original.length > 0" :open="users_list.length > 0">
			<summary>Utilisateurs</summary>

			<ul class="[ list:reset ]">
				<ChannelNickComponent
					tag="li"
					v-for="filtered_member in users_list"
					:key="filtered_member.id"
					:id="filtered_member.id"
					:classes="filtered_member.class_name"
					:hits="
						'search_hits' in filtered_member
							? filtered_member.search_hits
							: []
					"
					:is-current-client="filtered_member.is_current_client"
					:nickname="filtered_member.nickname"
					:symbol="filtered_member.access_level.highest.symbol"
					class="channel/nick"
					@dblclick="open_private_handler(filtered_member)"
					@click="select_user_handler(filtered_member)"
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

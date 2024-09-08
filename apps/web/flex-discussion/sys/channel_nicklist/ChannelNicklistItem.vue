<script setup lang="ts">
import type {
	ChannelMember,
	ChannelMemberFiltered,
	ChannelMemberUnfiltered,
} from "@phisyx/flex-chat";

import ChannelNick from "#/sys/channel_nick/ChannelNick.template.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	list: Array<
		| ChannelMemberFiltered
		| ChannelMemberUnfiltered
		| ChannelMember
	>;
	title: string;
	open?: boolean;
	useIconInsteadOfAvatar?: boolean;
}

interface Emits
{
	(event_name: "open-private", origin: Origin): void;
	(event_name: "select-member", origin: Origin): void;
}

interface Slots
{
	"user-info": (_: { member: Props["list"][number] }) => unknown;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

let channel_member_title_attribute =
	"· Simple clique: ouvrir le menu du membre du salon... \n" +
	"· Double clique: ouvrir la discussion privé avec le membre du salon\n";

// -------- //
// Handlers //
// -------- //

const open_private_handler = (member: ChannelMember) =>
	emit("open-private", member);
const select_user_handler = (member: ChannelMember) =>
	emit("select-member", member);
</script>

<template>
	<details :open="open">
		<summary class="[ f-size=15px pos-s ]">
			{{ title }}
		</summary>

		<ul class="[ flex! gap=2 list:reset f-size=14px ]">
			<template v-for="filtered_member in list" :key="filtered_member.id">
				<li
					class="[ flex gap=1 py=1 align-i:center cursor:pointer ]"
					@dblclick="open_private_handler(filtered_member)"
					@click="select_user_handler(filtered_member)"
				>
					<ChannelNick
						tag="div"
						:member="filtered_member"
						:with-avatar="!useIconInsteadOfAvatar"
						:title="channel_member_title_attribute"
						class="channel/nick [ flex:full ]"
					/>

					<slot name="user-info" :member="filtered_member" />
				</li>
			</template>
		</ul>
	</details>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

details[open] > summary {
	margin-top: fx.space(-1);
	margin-bottom: fx.space(2);
	padding-block: fx.space(1);
}

summary {
	list-style-type: none;
	text-transform: uppercase;

	color: var(--room-userlist-group-color);
	backdrop-filter: blur(8px);
}

@include fx.class("channel/nick") {
	border-radius: 4px;
}
</style>

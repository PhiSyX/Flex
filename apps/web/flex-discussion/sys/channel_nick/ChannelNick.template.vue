<script lang="ts" setup>
import {
	type ChannelMember,
	type ChannelMemberFiltered,
	type ChannelMemberUnfiltered,
	type User,
	is_channel_member,
} from "@phisyx/flex-chat";

import { computed } from "vue";

import Avatar from "#/api/avatar/Avatar.vue";

// ---- //
// Type //
// ---- //

interface Props {
	member:
		| ChannelMember
		| ChannelMemberFiltered
		| ChannelMemberUnfiltered
		| User;
	withAvatar?: boolean;
	prefix?: string;
	suffix?: string;
	tag?: keyof HTMLElementTagNameMap;
}

// --------- //
// Composant //
// --------- //

const { member, tag = "span", withAvatar = true } = defineProps<Props>();

let avatar_alt = computed(() =>
	withAvatar && member.id
		? `Avatar du compte de ${member.nickname}.`
		: undefined,
);
let avatar_or_span = computed(() =>
	withAvatar && member.id ? Avatar : "span",
);

let hits = computed(() =>
	Object.hasOwn(member, "search_hits") ? member.search_hits : [],
);

let symbol = computed(() => {
	if (is_channel_member(member)) {
		return member.access_level.highest.symbol;
	}
	if (Object.hasOwn(member, "access_level")) {
		return member.access_level.highest.symbol;
	}
	return undefined;
});
</script>

<template>
	<component
		:is="tag"
		:data-myself="member.is_current_client"
		:class="member.class_name"
	>
		<component :is="avatar_or_span" :id="member.id" :alt="avatar_alt">
			<span v-if="prefix" class="prefix">{{ prefix }}</span>
			<span v-if="symbol" class="channel/nick:symbol">{{ symbol }}</span>
			<bdo v-if="hits && hits.length > 0" :class="member.class_name">
				<template v-for="(substring, idx) of hits" :key="idx">
					<mark
						:key="idx + '!'"
						v-if="!substring.is_symbol"
						:class="[{ hit: substring.type === 'HIT' }]"
					>
						{{ substring.word }}
					</mark>
					<mark v-else :key="idx + '?'">{{ member.nickname }}</mark>
				</template>
			</bdo>
			<bdo v-else :class="member.class_name">{{ member.nickname }}</bdo>
			<span v-if="suffix" class="suffix">{{ suffix }}</span>
		</component>
	</component>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

bdo {
	color: var(--room-target-color);
	word-break: break-all;
	hyphens: manual;
	cursor: pointer;
}

[data-myself="true"] bdo {
	color: var(--room-target-myself-color, var(--room-target-color));
}

mark {
	background-color: transparent;
	color: inherit;
}

.hit {
	--room-userlist-filter-color: var(--default-text-color_alt);
	animation: hits 500ms ease-in-out;
	padding-inline: 2px;
	border-radius: 2px;
	background-color: hsl(var(--room-userlist-filter-bg_hsl));
	color: var(--room-userlist-filter-color);
	filter: drop-shadow(hsl(var(--room-userlist-filter-bg_hsl)) 0px 0px 2px);
}

@keyframes hits {
	50% {
		opacity: 0.5;
	}
}
</style>

<script lang="ts" setup>
import type { ChannelMemberSearchHits } from "@phisyx/flex-chat";

// ---- //
// Type //
// ---- //

interface Props {
	classes?: string;
	hits?: Array<ChannelMemberSearchHits>;
	isCurrentClient?: boolean;
	nickname: string;
	prefix?: string;
	suffix?: string;
	symbol?: string;
	tag?: keyof HTMLElementTagNameMap;
}

// --------- //
// Composant //
// --------- //

withDefaults(defineProps<Props>(), { tag: "bdo" });
</script>

<template>
	<component :is="tag" :data-myself="isCurrentClient" :class="classes">
		<span class="prefix">{{ prefix }}</span>
		<span class="channel/nick:symbol">{{ symbol }}</span>
		<bdo v-if="hits && hits.length > 0" :class="classes">
			<template v-for="(substring, idx) of hits" :key="idx">
				<mark
					:key="idx + '!'"
					v-if="!substring.isSymbol"
					:class="[{ hit: substring.type === 'HIT' }]"
				>
					{{ substring.word }}
				</mark>
				<mark v-else :key="idx + '?'">{{ nickname }}</mark>
			</template>
		</bdo>
		<bdo v-else :class="classes">
			{{ nickname }}
		</bdo>
		<span class="suffix">{{ suffix }}</span>
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

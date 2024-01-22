<script lang="ts" setup>
import { ChannelNickSearchHits } from '~/channel/ChannelNickFiltered';

// ---- //
// Type //
// ---- //

interface Props {
	classes?: string;
	hits?: Array<ChannelNickSearchHits>;
	isMe?: boolean;
	nickname: string;
	prefix?: string;
	suffix?: string;
	symbol?: string;
	tag: keyof HTMLElementTagNameMap;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<component :is="tag" :data-myself="isMe" :class="classes">
		<span class="prefix">{{ prefix }}</span>
		<span class="channel/nick:symbol">{{ symbol }}</span>
		<bdi v-if="hits && hits.length > 0" :class="classes">
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
		</bdi>
		<bdi v-else :class="classes">
			{{ nickname }}
		</bdi>
		<span class="suffix">{{ suffix }}</span>
	</component>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

bdi {
	color: var(--room-nick-color);
	word-break: break-all;
	hyphens: manual;
	cursor: pointer;
}

[data-myself="true"] bdi {
	color: var(--room-nick-myself-color, var(--room-nick-color));
}

mark {
	background-color: transparent;
	color: inherit;
}

.hit {
	--filter-color: var(--default-text-color_alt);
	@include fx.theme using ($name) {
		@if $name == ice {
			--filter-bg_hsl: var(--color-cyan300_hsl);
		}
	}
	animation: hits 500ms ease-in-out;
	padding-inline: 2px;
	border-radius: 2px;
	background-color: hsl(var(--filter-bg_hsl));
	color: var(--filter-color);
	filter: drop-shadow(hsl(var(--filter-bg_hsl)) 0px 0px 2px);
}

@keyframes hits {
	50% {
		opacity: 0.5;
	}
}
</style>

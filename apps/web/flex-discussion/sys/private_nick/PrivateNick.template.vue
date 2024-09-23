<script lang="ts" setup>
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";

// ---- //
// Type //
// ---- //

interface Props {
	participant: PrivateParticipant;
	prefix?: string;
	suffix?: string;
	tag?: keyof HTMLElementTagNameMap;
}

// --------- //
// Composant //
// --------- //

withDefaults(defineProps<Props>(), { tag: "span" });
</script>

<template>
	<component :is="tag" :data-myself="participant.is_current_client">
		<span class="prefix">{{ prefix }}</span>
		<bdo>{{ participant.nickname }}</bdo>
		<span class="suffix">{{ suffix }}</span>
	</component>
</template>

<style lang="scss" scoped>
@use "@phisyx/flexsheets" as fx;

bdo {
	color: var(--room-target-color);
	word-break: break-all;
	hyphens: manual;
	cursor: pointer;
}

[data-myself="true"] bdo {
	color: var(--room-target-myself-color, var(--room-target-color));
}
</style>

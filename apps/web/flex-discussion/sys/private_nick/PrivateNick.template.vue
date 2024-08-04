<script lang="ts" setup>
// ---- //
// Type //
// ---- //

interface Props
{
	isCurrentClient?: boolean;
	nickname: string;
	prefix?: string;
	suffix?: string;
	tag: keyof HTMLElementTagNameMap;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
</script>

<template>
	<component :is="tag" :data-myself="isCurrentClient">
		<span class="prefix">{{ prefix }}</span>
		<bdo>{{ nickname }}</bdo>
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
</style>

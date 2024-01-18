<script setup lang="ts">
// --------- //
// Composant //
// --------- //
</script>

<template>
	<div class="room/topic">
		<div class="room/topic:text">
			<slot name="topic" />
		</div>

		<div class="room/topic:action">
			<slot name="topic-action" />
		</div>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/topic") {
	display: flex;
	align-items: center;
	gap: fx.space(1);
	padding: fx.space(1);
	min-height: fx.space(60);
	font-size: 14px;
	background: var(--room-topic-bg);

	p:not([contenteditable]) {
		color: var(--room-placeholder);
	}
}

@include fx.class("room/topic:text") {
	flex-grow: 1;
	height: 100%;
	max-height: fx.space(12);
	overflow: hidden;
	overflow-y: auto !important;
	overscroll-behavior-y: contain;
	scroll-snap-type: y mandatory;
}

@include fx.class("room/topic:action") {
	display: flex;
	gap: fx.space(2);
	min-width: fit-content;
}
</style>

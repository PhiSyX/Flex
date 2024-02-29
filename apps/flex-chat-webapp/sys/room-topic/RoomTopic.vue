<script setup lang="ts">
// --------- //
// Composant //
// --------- //
</script>

<template>
	<div class="room/topic [ flex align-i:center gap=1 p=1 min-h=8 ]">
		<div class="room/topic:text [ flex:full ov:y h:full max-h ]">
			<slot name="topic" />
		</div>

		<div class="room/topic:action [ flex gap=2 min-w:fit ]">
			<slot name="topic-action" />
		</div>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("room/topic") {
	font-size: 14px;
	background: var(--room-topic-bg);

	p:not([contenteditable]) {
		color: var(--room-placeholder);
	}
}
</style>

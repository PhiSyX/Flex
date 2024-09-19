<script setup lang="ts">
// --------- //
// Interface //
// --------- //

interface Slots {
	default: unknown;
	actions: unknown;
}

// --------- //
// Composant //
// --------- //
defineSlots<Slots>();
</script>

<template>
	<div
		class="action-bar [ flex align-i:center gap=1 p=1 min-h=8 f-size=14px ]"
	>
		<div class="action-bar:text [ flex:full ov:y h:full max-h ]">
			<slot />
		</div>

		<div class="action-bar:actions [ flex gap=2 min-w:fit ]">
			<slot name="actions" />
		</div>
	</div>
</template>

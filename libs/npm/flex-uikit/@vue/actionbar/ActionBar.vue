<script setup lang="ts">
import type { ActionBarChildren } from "@phisyx/flex-uikit/actionbar/children";

defineSlots<ActionBarChildren>();
</script>

<template>
	<div
		class="fx:action-bar [ flex align-i:center gap=1 p=1 min-h=8 f-size=14px ]"
	>
		<div class="fx:action-bar/text [ flex:full ov:y h:full max-h ]">
			<slot />
		</div>

		<div class="fx:action-bar/actions [ flex gap=1 min-w:fit ]">
			<slot name="actions" />
		</div>
	</div>
</template>

<style scoped lang="scss">
@use "@phisyx/flex-uikit-stylesheets/actionbar/ActionBar.scss";
</style>

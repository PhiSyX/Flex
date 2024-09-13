<script setup lang="ts">
// --------- //
// Interface //
// --------- //

interface Slots {
	default: unknown;
}

// --------- //
// Composant //
// --------- //

defineSlots<Slots>();
</script>

<template>
	<menu class="[ pos-r p=0 f-size=13px f-family=nunito ]" role="menu">
		<slot />
	</menu>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

menu {
	min-width: fx.space(250);
	max-width: fx.space(250);

	list-style: none;
	border-radius: 8px;
	overflow: hidden;

	background: var(--menu-bg);
	box-shadow: 2px 2px 4px var(--color-black);
}
</style>

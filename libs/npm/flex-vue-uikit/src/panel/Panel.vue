<script lang="ts">
// ----------- //
// Énumération //
// ----------- //

export enum PanelFooterPosition {
	Left = "left",
	Right = "right",
	Center = "center",
}
</script>

<script setup lang="ts">
// ---- //
// Type //
// ---- //

interface Props {
	inlineFooter?: boolean;
	footerPosition?: PanelFooterPosition;
	withPadding?: boolean;
}

interface Slots {
	heading: unknown;
	default: unknown;
	footer: unknown;
}

// --------- //
// Composant //
// --------- //

const {
	inlineFooter = false,
	footerPosition = PanelFooterPosition.Right,
	withPadding = true,
} = defineProps<Props>();
defineSlots<Slots>();
</script>

<template>
	<div
		class="panel"
		:class="{
			'p=1': withPadding,
		}"
	>
		<header v-if="$slots.heading" class="panel/title [ flex! gap=1 p=1 ]">
			<slot name="heading" />
		</header>

		<div class="panel/body [ p=1 ]">
			<slot />
		</div>

		<footer
			v-if="$slots.footer"
			class="panel/footer [ p=1 gap=1 ]"
			:class="{
				flex: inlineFooter,
				'flex!': !inlineFooter,
				'align-jc:start': footerPosition === PanelFooterPosition.Left,
				'align-jc:center':
					footerPosition === PanelFooterPosition.Center,
				'align-jc:end': footerPosition === PanelFooterPosition.Right,
			}"
		>
			<slot name="footer" />
		</footer>
	</div>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

@include fx.class("panel") {
	background: var(--panel-bg, var(--color-white));
	color: var(--panel-color, var(--default-text-color_alt));
}
@include fx.class("panel/title") {
	background: var(--panel-heading-bg);
	color: var(--panel-color, var(--default-text-color_alt));
}
@include fx.class("panel/body") {
	background: var(--panel-body-bg);
	color: var(--panel-color, var(--default-text-color_alt));
}
@include fx.class("panel/footer") {
	background: var(--panel-footer-bg);
	color: var(--panel-color, var(--default-text-color_alt));
}
</style>

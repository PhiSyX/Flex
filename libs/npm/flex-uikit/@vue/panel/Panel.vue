<script setup lang="ts">
import type { PanelChildren } from "@phisyx/flex-uikit/panel/children";
import type { PanelProps } from "@phisyx/flex-uikit/panel/props";

const {
	basePadding = false,
	footerAlignment = "right",
	footerInline = false,
} = defineProps<PanelProps>();

defineSlots<PanelChildren>();
</script>

<template>
	<div class="fx:panel" :class="{ 'p=1': basePadding }">
		<header
			v-if="$slots.heading"
			class="fx:panel/title [ flex! gap=1 p=1 ]"
		>
			<slot name="heading" />
		</header>

		<div class="fx:panel/body [ p=1 ]">
			<slot />
		</div>

		<footer
			v-if="$slots.footer"
			class="fx:panel/footer [ gap=1 p=1 ]"
			:class="{
				flex: footerInline,
				'flex!': !footerInline,
				[`align-jc:${footerAlignment}`]: footerAlignment,
			}"
		>
			<slot name="footer" />
		</footer>
	</div>
</template>

<style scoped lang="scss">
@use "@phisyx/flex-uikit-stylesheets/panel/Panel.scss";
</style>

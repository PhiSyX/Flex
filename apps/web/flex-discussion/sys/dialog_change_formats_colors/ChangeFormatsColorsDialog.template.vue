<script lang="ts" setup>
import { computed, ref } from "vue";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";

import ChangeColorPreset from "./ChangeColorPreset.vue";
import ChangeFormat from "./ChangeFormat.vue";

// --------- //
// Composant //
// --------- //

let bold_selected = defineModel<boolean | null>("bold");
let italic_selected = defineModel<boolean | null>("italic");
let underline_selected = defineModel<boolean | null>("underline");

let background_selected = defineModel<number | null>("background");
let foreground_selected = defineModel<number | null>("foreground");

let reveal_background_box = ref(false);
let reveal_icon = computed(() =>
	reveal_background_box.value ? "icon-arrow-up" : "icon-arrow-down",
);
</script>

<template>
	<dialog
		:class="{
			'pb=0': !reveal_background_box,
		}"
		class="dialog/change-formats-colors [ flex! gap=2 m=0 py=3 px=2 max-w=38 ]"
	>
		<h1 class="[ f-size=13px m=0 p=0 ]">Formats</h1>

		<div class="[ flex gap=1 ]">
			<ChangeFormat v-model="bold_selected" value="bold">
				Gras
			</ChangeFormat>

			<ChangeFormat v-model="italic_selected" value="italic">
				Italique
			</ChangeFormat>

			<ChangeFormat v-model="underline_selected" value="underline">
				Souligné
			</ChangeFormat>
		</div>

		<h1 class="[ f-size=13px m=0 p=0 ]">Choisir une couleur de premier plan</h1>

		<div class="dialog/change-formats-colors:foreground [ p=1 gap=1 ]">
			<ChangeColorPreset
				v-for="i in 16"
				:key="foreground_selected ?? i"
				:preset="i - 1"
				type="foreground"
				v-model="foreground_selected"
			/>
		</div>

		<div class="[ align-t:center ]">
			<Button
				v-model:selected="reveal_background_box"
				:true-value="true" :false-value="false"
			>
				<component :is="reveal_icon" variant="chevron" />
			</Button>
		</div>

		<template v-if="reveal_background_box">
			<h1 class="[ f-size=13px m=0 p=0 ]">Choisir une couleur de second plan</h1>

			<div class="dialog/change-formats-colors:background [ p=1 gap=1 ]">
				<ChangeColorPreset
					v-for="i in 16"
					:key="background_selected ?? i"
					:preset="i - 1"
					type="background"
					v-model="background_selected"
				/>
			</div>
		</template>
	</dialog>
</template>

<style lang="scss" scoped>
@use "@phisyx/flexsheets" as fx;

@include fx.class("dialog/change-formats-colors") {
	border: 1px outset;
	border-radius: 2px;
	background: var(--dialog-change-formats-colors-bg);
}

@include fx.class("dialog/change-formats-colors:background") {
	display: grid;
	grid-template-columns: repeat(8, fx.space(3));
}

@include fx.class("dialog/change-formats-colors:foreground") {
	display: grid;
	grid-template-columns: repeat(8, fx.space(3));
}
</style>

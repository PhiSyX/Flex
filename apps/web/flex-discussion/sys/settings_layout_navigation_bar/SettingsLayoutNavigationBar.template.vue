<script lang="ts" setup>
import InputLabelSwitch from "@phisyx/flex-uikit-vue/input/InputLabelSwitch.vue";

// --------- //
// Composant //
// --------- //

let navigation_bar_position = defineModel<"left" | "right">();
</script>

<template>
	<form
		action="/chat/settings/layout/navigation-bar"
		method="POST"
		class="[ flex! gap=2 ]"
	>
		<div class="[ flex align-jc:sb align-ji:center gap=2 ]">
			<label>Position</label>

			<InputLabelSwitch
				name="navigation-bar"
				label-y="Gauche"
				value-y="left"
				label-n="Droite"
				value-n="right"
				v-model="navigation_bar_position"
			/>
		</div>
	</form>
</template>

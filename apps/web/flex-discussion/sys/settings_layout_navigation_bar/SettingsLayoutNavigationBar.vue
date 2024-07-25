<script lang="ts" setup>
import { InputSwitch } from "@phisyx/flex-vue-uikit";

const navigationBarPosition = defineModel<"left" | "right">();
</script>

<template>
	<form
		action="/chat/settings/layout/navigation-bar"
		method="POST"
		class="[ flex! gap=2 ]"
	>
		<div class="[ flex align-jc:sb align-ji:center gap=2 ]">
			<label>Position</label>

			<InputSwitch
				name="navigation-bar"
				label-y="Gauche"
				value-y="left"
				label-n="Droite"
				value-n="right"
				v-model="navigationBarPosition"
			/>
		</div>
	</form>
</template>

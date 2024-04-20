<script lang="ts" setup>
import { InputSwitch } from "@phisyx/flex-uikit";

import { useSettingsStore } from "~/store/SettingsStore";

const settingsStore = useSettingsStore();
</script>

<template>
	<h2>Barre de navigation</h2>

	<form
		action="/chat/settings/layout/navigation-bar"
		method="POST"
		class="[ flex gap=2 ]"
	>
		<div class="[ flex align-ji:center gap=2 ]">
			<label>Position:</label>
			<InputSwitch
				name="navigation-bar"
				label-y="Gauche"
				value-y="left"
				label-n="Droite"
				value-n="right"
				v-model="settingsStore.layout.navigationBarPosition"
			/>
		</div>
	</form>
</template>

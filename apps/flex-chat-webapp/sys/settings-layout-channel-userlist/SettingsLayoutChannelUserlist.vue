<script lang="ts" setup>
import { InputSwitch } from "@phisyx/flex-uikit";

const userlistDisplay = defineModel<boolean>("display");
const userlistPosition = defineModel<"left" | "right">("position");
</script>

<template>
	<form
		action="/chat/settings/layout/channel-userlist"
		method="POST"
		class="[ flex! gap=2 ]"
	>
		<div class="[ flex! ]">
			<div class="flex align-ji:center gap=2">
				<label>Afficher par défaut:</label>

				<InputSwitch
					name="channel-userlist2"
					label-y="Oui"
					label-n="Non"
					v-model="userlistDisplay"
				/>
			</div>

			<div class="flex align-ji:center gap=2">
				<label>Position:</label>

				<InputSwitch
					name="channel-userlist"
					label-y="Gauche"
					value-y="left"
					label-n="Droite"
					value-n="right"
					v-model="userlistPosition"
				/>
			</div>
		</div>
	</form>
</template>

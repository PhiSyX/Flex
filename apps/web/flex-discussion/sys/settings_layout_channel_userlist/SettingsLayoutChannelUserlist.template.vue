<script lang="ts" setup>
import InputLabelSwitch from "@phisyx/flex-uikit-vue/input/InputLabelSwitch.vue";

// --------- //
// Composant //
// --------- //

let userlist_display = defineModel<boolean>("display");
let userlist_position = defineModel<"left" | "right">("position");
</script>

<template>
	<form
		action="/chat/settings/layout/channel-userlist"
		method="POST"
		class="[ flex! gap=2 ]"
	>
		<div class="flex align-jc:sb align-ji:center gap=2">
			<label>Afficher la liste par défaut</label>

			<InputLabelSwitch
				name="channel-userlist2"
				label-y="Oui"
				label-n="Non"
				v-model="userlist_display"
			/>
		</div>

		<div class="flex align-jc:sb align-ji:center gap=2">
			<label>Position</label>

			<InputLabelSwitch
				name="channel-userlist"
				label-y="Gauche"
				value-y="left"
				label-n="Droite"
				value-n="right"
				v-model="userlist_position"
			/>
		</div>
	</form>
</template>

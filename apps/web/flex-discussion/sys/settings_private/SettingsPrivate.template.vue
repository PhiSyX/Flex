<script lang="ts" setup>
import { InputSwitch } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props {}

// --------- //
// Composant //
// --------- //

let waitingPrivateList = defineModel<boolean>("waitingList", {
	required: true,
});
</script>

<template>
    <form
		action="/chat/settings/layout/navigation-bar"
		method="POST"
		class="[ flex! gap=2 ]"
	>
		<div class="[ flex align-jc:sb align-ji:center gap=2 ]">
			<label>Mettre en attente les nouveaux privés?</label>

			<InputSwitch
				name="waiting-private-list"
				label-y="Oui"
				label-n="Non"
				v-model="waitingPrivateList"
			/>
		</div>
	</form>
</template>

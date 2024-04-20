<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";

import type { View } from "../index";

import { useSettingsStore } from "~/store/SettingsStore";

import ThemePersonalizationSettings from "./personalization/Theme.vue";

interface Props {
	previousView: View;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const changeView = defineModel<View>("changeView");

const settingsStore = useSettingsStore();

function saveAndExit() {
	settingsStore.save();
	changeView.value = props.previousView;
}
</script>

<template>
	<main id="settings-view" class="[ flex w:full h:full ]">
		<div class="sidebar [ p=1 ]">
			<UiButton icon="arrow-left" @click="saveAndExit"> Retour </UiButton>
		</div>

		<div class="content [ flex! w:full scroll:y ]">
			<section>
				<h1 class="[ pos-s ]">Personnalisation</h1>

				<ThemePersonalizationSettings />
			</section>
		</div>
	</main>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

.content {
	margin: 0 auto;
	max-width: 80ch;
}

h1 {
	padding: fx.space(1);
	backdrop-filter: blur(8px);
}
</style>

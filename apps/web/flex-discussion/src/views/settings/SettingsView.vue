<script setup lang="ts">
import type { View } from "@phisyx/flex-chat";

import { UiButton } from "@phisyx/flex-vue-uikit";

import { use_settings_store } from "~/store";

import SettingsLayoutChannelUserlist from "./layout/ChannelUserlist.vue";
import SettingsLayoutNavigationBar from "./layout/NavigationBar.vue";
import SettingsPersonalizationTheme from "./personalization/Theme.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	previousView: View;
}

// --------- //
// Composant //
// --------- //

let settings_store = use_settings_store();

const props = defineProps<Props>();
let change_view = defineModel<View>("changeView");

// ------- //
// Handler //
// ------- //

function save_and_exit_handler()
{
	settings_store.persist();
	change_view.value = props.previousView;
}
</script>

<template>
	<main id="settings-view" class="[ flex w:full h:full ]">
		<div class="sidebar [ p=1 ]">
			<UiButton icon="arrow-left" @click="save_and_exit_handler">
				Retour
			</UiButton>
		</div>

		<div class="content [ flex! w:full scroll:y ]">
			<section class="[ p=1 ]">
				<h1 class="[ pos-s ]">Personnalisation</h1>

				<SettingsPersonalizationTheme />
			</section>

			<section class="[ p=1 ]">
				<h1 class="[ pos-s ]">Disposition</h1>

				<SettingsLayoutNavigationBar />
				<SettingsLayoutChannelUserlist />
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
	padding-block: fx.space(1);
	backdrop-filter: blur(8px);
}
</style>

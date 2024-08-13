<script setup lang="ts">
import { useRouter as use_router } from "vue-router";

import { View } from "@phisyx/flex-chat";
import { UiButton } from "@phisyx/flex-vue-uikit";

import { use_chat_store, use_settings_store } from "~/store";

import SettingsLayoutChannelUserlist from "./layout/ChannelUserlist.vue";
import SettingsLayoutNavigationBar from "./layout/NavigationBar.vue";
import SettingsNotificationSoundEffect from "./notification/SoundEffect.vue";
import SettingsPersonalizationTheme from "./personalization/Theme.vue";


// --------- //
// Composant //
// --------- //

let router = use_router();
let chat_store = use_chat_store();
let settings_store = use_settings_store();

// ------- //
// Handler //
// ------- //

function save_and_exit_handler()
{
	settings_store.persist();

	if (chat_store.store.is_connected()) {
		router.replace({name: View.Chat });
		return;
	}

	router.back();
}
</script>

<template>
	<main id="settings-view" class="[ flex w:full h:full ]">
		<div class="sidebar [ p=1 ]">
			<UiButton icon="arrow-left" @click="save_and_exit_handler">
				Retour
			</UiButton>
		</div>

		<div class="content [ flex! gap=1 w:full scroll:y p=1 ]">
			<section>
				<h1 class="[ pos-s ]">Personnalisation</h1>

				<SettingsPersonalizationTheme />
			</section>

			<section>
				<h1 class="[ pos-s ]">Disposition</h1>

				<SettingsLayoutNavigationBar />
				<SettingsLayoutChannelUserlist />
			</section>
			
			<section>
				<h1 class="[ pos-s ]">Notification</h1>

				<SettingsNotificationSoundEffect />
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

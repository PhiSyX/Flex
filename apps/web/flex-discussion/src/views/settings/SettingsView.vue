<script setup lang="ts">
import { useRouter as use_router } from "vue-router";

import { ServerCustomRoom, View } from "@phisyx/flex-chat";
import { UiButton } from "@phisyx/flex-vue-uikit";

import { use_chat_store, use_settings_store } from "~/store";

import SettingsLayoutChannelUserlist from "./layout/ChannelUserlist.vue";
import SettingsLayoutNavigationBar from "./layout/NavigationBar.vue";
import SettingsNotificationSoundEffect from "./notification/SoundEffect.vue";
import SettingsPersonalizationTheme from "./personalization/Theme.vue";
import SettingsPrivate from "./private/SettingsPrivate.vue";

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

	if (chat_store.is_connected()) {
		if (chat_store.room_manager().active().id() === ServerCustomRoom.ID) {
			router.replace({ name: View.Chat });
			return;
		}
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
			<details open>
				<summary class="[ pos-s ]">Personnalisation</summary>

				<SettingsPersonalizationTheme />
			</details>

			<details open>
				<summary class="[ pos-s ]">Disposition</summary>

				<SettingsLayoutNavigationBar />
				<SettingsLayoutChannelUserlist />
			</details>
			
			<details open>
				<summary class="[ pos-s ]">Notification</summary>

				<SettingsNotificationSoundEffect />
			</details>
			
			<details open>
				<summary class="[ pos-s ]">Privé</summary>

				<SettingsPrivate />
			</details>
		</div>
	</main>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

#settings-view {
	.content {
		margin: 0 auto;
		max-width: 80ch;
	}

	summary {
		padding-block: fx.space(1);
		backdrop-filter: blur(8px);
		font-size: 26px;
		font-weight: bold;
		list-style: none;
	}

	h2 {
		color: var(--color-grey500);
		font-size: 20px;
	}
}
</style>

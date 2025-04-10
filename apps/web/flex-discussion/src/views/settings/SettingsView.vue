<script setup lang="ts">
import type { SettingsView } from "@phisyx/flex-chat-ui/views/settings";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";

import { SettingsWireframe } from "@phisyx/flex-chat-ui/views/settings";
import { reactive } from "vue";
import { VueRouter } from "~/router";
import { use_chat_store, use_settings_store } from "~/store";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";

import SettingsLayoutChannelUserlist from "./layout/ChannelUserlist.vue";
import SettingsLayoutNavigationBar from "./layout/NavigationBar.vue";
import SettingsNotificationSoundEffect from "./notification/SoundEffect.vue";
import SettingsPersonalizationTheme from "./personalization/Theme.vue";
import SettingsPrivate from "./private/SettingsPrivate.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let settings_store = use_settings_store().store;

let view = reactive(
	SettingsWireframe.create(
		new VueRouter(),
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		settings_store as SettingsStore,
	),
) as SettingsView;
</script>

<template>
	<main id="settings-view" class="[ flex w:full h:full ]">
		<div class="sidebar [ p=1 ]">
			<Button icon="arrow-left" @click="view.save_and_exit_handler">
				Retour
			</Button>
		</div>

		<div class="content [ flex! gap=1 w:full scroll:y p=1 ]">
			<details open>
				<summary class="[ pos-s ]">Personnalisation</summary>

				<SettingsPersonalizationTheme :view="view" />
			</details>

			<details open>
				<summary class="[ pos-s ]">Disposition</summary>

				<SettingsLayoutNavigationBar :view="view" />
				<SettingsLayoutChannelUserlist :view="view" />
			</details>

			<details open>
				<summary class="[ pos-s ]">Notification</summary>

				<SettingsNotificationSoundEffect :view="view" />
			</details>

			<details open>
				<summary class="[ pos-s ]">Privé</summary>

				<SettingsPrivate :view="view" />
			</details>
		</div>
	</main>
</template>

<style lang="scss">
@use "@phisyx/flexsheets" as fx;

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

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import {
	SettingsStore,
	SettingsStoreData,
} from "@phisyx/flex-chat/store/settings";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, reactive, readonly } from "vue";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsStoreVue {
	// --------- //
	// Propriété //
	// --------- //

	private inner_store = new SettingsStore(
		reactive(new SettingsStoreData()) as SettingsStoreData,
	);

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get layout() {
		return computed(() => readonly(this.inner_store.get_layout()));
	}

	get notification() {
		return computed(() => readonly(this.inner_store.get_notification()));
	}

	get personalization() {
		return computed(() => readonly(this.inner_store.get_personalization()));
	}

	get priv4te() {
		return computed(() => readonly(this.inner_store.get_private()));
	}

	get channel_userlist_display_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_layout().channel_userlist_display;
			},
			set: ($1) => {
				this.inner_store.mut_layout((current) => ({
					...current,
					channel_userlist_display: $1,
				}));
			},
		});
	}
	get channel_userlist_position_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_layout().channel_userlist_position;
			},
			set: ($1) => {
				this.inner_store.mut_layout((current) => ({
					...current,
					channel_userlist_position: $1,
				}));
			},
		});
	}
	get navigation_bar_position_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_layout().navigation_bar_position;
			},
			set: ($1) => {
				this.inner_store.mut_layout((current) => ({
					...current,
					navigation_bar_position: $1,
				}));
			},
		});
	}

	get sounds_effect_enabled_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_notification().sounds.enabled;
			},
			set: ($1) => {
				this.inner_store.mut_notification((current) => ({
					sounds: { ...current.sounds, enabled: $1 },
				}));
			},
		});
	}
	get sounds_effect_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_notification().sounds;
			},
			set: ($1) => {
				this.inner_store.mut_notification((current) => ({
					sounds: { ...current.sounds, ...$1 },
				}));
			},
		});
	}

	get text_format_bold_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_personalization().formats.bold;
			},
			set: ($1) => {
				this.inner_store.mut_personalization((current) => ({
					formats: { ...current.formats, bold: $1 },
				}));
			},
		});
	}
	get text_format_italic_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_personalization().formats.italic;
			},
			set: ($1) => {
				this.inner_store.mut_personalization((current) => ({
					formats: { ...current.formats, italic: $1 },
				}));
			},
		});
	}
	get text_format_underline_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_personalization().formats.underline;
			},
			set: ($1) => {
				this.inner_store.mut_personalization((current) => ({
					formats: { ...current.formats, underline: $1 },
				}));
			},
		});
	}

	get text_color_background_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_personalization().colors.background;
			},
			set: ($1) => {
				this.inner_store.mut_personalization((current) => ({
					colors: { ...current.formats, background: $1 },
				}));
			},
		});
	}
	get text_color_foreground_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_personalization().colors.foreground;
			},
			set: ($1) => {
				this.inner_store.mut_personalization((current) => ({
					colors: { ...current.formats, foreground: $1 },
				}));
			},
		});
	}

	get theme_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_personalization().theme;
			},
			set: ($1) => {
				this.inner_store.mut_personalization((current) => ({
					...current,
					theme: $1,
				}));
			},
		});
	}

	get waiting_private_list_mut() {
		return computed({
			get: () => {
				return this.inner_store.get_private().waiting_list;
			},
			set: ($1) => {
				this.inner_store.mut_private((_current) => ({
					waiting_list: $1,
				}));
			},
		});
	}

	get_layout() {
		return this.inner_store.get_layout();
	}

	get_notification() {
		return this.inner_store.get_notification();
	}

	get_personalization() {
		return this.inner_store.get_personalization();
	}

	get_private() {
		return this.inner_store.get_private();
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	real_store(): SettingsStore {
		return this.inner_store;
	}

	public persist() {
		this.inner_store.persist();
	}
}

export const use_settings_store = defineStore(SettingsStore.NAME, () => {
	const store = new SettingsStoreVue();

	return {
		store: store.real_store(),

		layout: store.layout,
		notification: store.notification,
		personalization: store.personalization,
		priv4te: store.priv4te,

		get_layout: store.get_layout.bind(store),
		get_notification: store.get_notification.bind(store),
		get_personalization: store.get_personalization.bind(store),
		get_private: store.get_private.bind(store),

		channel_userlist_display_mut: store.channel_userlist_display_mut,
		channel_userlist_position_mut: store.channel_userlist_position_mut,
		navigation_bar_position_mut: store.navigation_bar_position_mut,

		sounds_effect_enabled_mut: store.sounds_effect_enabled_mut,
		sounds_effect_mut: store.sounds_effect_mut,

		text_format_bold_mut: store.text_format_bold_mut,
		text_format_italic_mut: store.text_format_italic_mut,
		text_format_underline_mut: store.text_format_underline_mut,
		text_color_background_mut: store.text_color_background_mut,
		text_color_foreground_mut: store.text_color_foreground_mut,

		theme_mut: store.theme_mut,

		waiting_private_list_mut: store.waiting_private_list_mut,

		persist: store.persist.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(
		acceptHMRUpdate(use_settings_store, import.meta.hot),
	);
}

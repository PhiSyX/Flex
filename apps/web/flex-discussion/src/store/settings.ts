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
	acceptHMRUpdate as accept_hmr_update,
	defineStore as define_store
} from "pinia";
import { computed, reactive, readonly } from "vue";

import { SettingsStore, SettingsStoreData } from "@phisyx/flex-chat";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsStoreVue 
{
	// --------- //
	// Propriété //
	// --------- //

	#store = new SettingsStore(reactive(new SettingsStoreData()) as SettingsStoreData)

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get layout() 
	{
		return computed(() => readonly(this.#store.get_layout()));
	}

	get notification() 
	{
		return computed(() => readonly(this.#store.get_notification()));
	}

	get personalization() 
	{
		return computed(() => readonly(this.#store.get_personalization()));
	}

	get channel_userlist_display_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_layout().channel_userlist_display;
			},
			set: ($1) => {
				this.#store.mut_layout((current) => ({
					...current,
					channel_userlist_display: $1,
				}));
			}
		});
	}
	get channel_userlist_position_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_layout().channel_userlist_position;
			},
			set: ($1) => {
				this.#store.mut_layout((current) => ({
					...current,
					channel_userlist_position: $1,
				}));
			}
		});
	}
	
	get sounds_effect_enabled_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_notification().sounds.enabled;
			},
			set: ($1) => {
				this.#store.mut_notification((current) => ({
					sounds: { ...current.sounds, enabled: $1 }
				}));
			}
		});
	}
	get sounds_effect_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_notification().sounds;
			},
			set: ($1) => {
				this.#store.mut_notification((current) => ({
					sounds: { ...current.sounds, ...$1 }
				}));
			}
		});
	}

	get text_format_bold_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_personalization().formats.bold;
			},
			set: ($1) => {
				this.#store.mut_personalization((current) => ({
					formats:{ ...current.formats, bold: $1 },
				}));
			}
		});
	}
	get text_format_italic_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_personalization().formats.italic;
			},
			set: ($1) => {
				this.#store.mut_personalization((current) => ({
					formats: { ...current.formats, italic: $1 },
				}));
			}
		});
	}
	get text_format_underline_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_personalization().formats.underline;
			},
			set: ($1) => {
				this.#store.mut_personalization((current) => ({
					formats:{ ...current.formats, underline: $1 },
				}));
			}
		});
	}

	get text_color_background_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_personalization().colors.background;
			},
			set: ($1) => {
				this.#store.mut_personalization((current) => ({
					colors:{ ...current.formats, background: $1 },
				}));
			}
		});
	}
	get text_color_foreground_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_personalization().colors.foreground;
			},
			set: ($1) => {
				this.#store.mut_personalization((current) => ({
					colors:{ ...current.formats, foreground: $1 },
				}));
			}
		});
	}

	get theme_mut()
	{
		return computed({
			get: () => {
				return this.#store.get_personalization().theme;
			},
			set: ($1) => {
				this.#store.mut_personalization((current) => ({
					...current,
					theme: $1,
				}));
			}
		});
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	public persist()
	{
		this.#store.persist();
	}
}

export const use_settings_store = define_store(SettingsStore.NAME, () => {
	const store = new SettingsStoreVue();

	return {
		layout: store.layout,
		notification: store.notification,
		personalization: store.personalization,

		channel_userlist_display_mut: store.channel_userlist_display_mut,
		channel_userlist_position_mut: store.channel_userlist_position_mut,

		sounds_effect_enabled_mut: store.sounds_effect_enabled_mut,
		sounds_effect_mut: store.sounds_effect_mut,

		text_format_bold_mut: store.text_format_bold_mut,
		text_format_italic_mut: store.text_format_italic_mut,
		text_format_underline_mut: store.text_format_underline_mut,
		text_color_background_mut: store.text_color_background_mut,
		text_color_foreground_mut: store.text_color_foreground_mut,

		theme_mut: store.theme_mut,

		persist: store.persist.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(accept_hmr_update(use_settings_store, import.meta.hot));
}

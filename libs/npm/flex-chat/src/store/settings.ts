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
	type LayoutData,
	LayoutStorage,
} from "../localstorage/settings_layout";
import {
	type NotificationData,
	NotificationStorage
} from "../localstorage/settings_notification";
import {
	type PersonalizationData,
	PersonalizationStorage,
} from "../localstorage/settings_personalization";

export class SettingsStore 
{
	static readonly NAME = "settings-store";

	// --------- //
	// Propriété //
	// --------- //

	notification: NotificationSettings = new NotificationSettings();
	personalization: PersonalizationSettings = new PersonalizationSettings();
	layout: LayoutSettings = new LayoutSettings();

	persist()
	{
		this.notification.persist();
		this.personalization.persist();
		this.layout.persist();
	}
}

export class PersonalizationSettings 
{
	storage = new PersonalizationStorage();

	get theme()
	{
		return this.storage.value.theme;
	}
	set theme(value: PersonalizationData["theme"])
	{
		this.storage.set({ ...this.storage.value, theme: value });
	}

	get colors()
	{
		return this.storage.value.colors;
	}
	set colors(value: PersonalizationData["colors"])
	{
		this.storage.set({ ...this.storage.value, colors: value });
	}

	get formats()
	{
		return this.storage.value.formats;
	}
	set formats(value: PersonalizationData["formats"])
	{
		this.storage.set({ ...this.storage.value, formats: value });
	}

	persist()
	{
		this.storage.set({
			theme: this.theme,
			colors: this.colors,
			formats: this.formats,
		});
	}
}

export class LayoutSettings 
{
	storage = new LayoutStorage();

	get channel_userlist_display()
	{
		return this.storage.get().channel_userlist_display;
	}

	set channel_userlist_display(value: LayoutData["channel_userlist_display"])
	{
		this.storage.set({
			...this.storage.value,
			channel_userlist_display: value,
		});
	}

	get channel_userlist_position()
	{
		return this.storage.get().channel_userlist_position;
	}

	set channel_userlist_position(value: LayoutData["channel_userlist_position"])
	{
		this.storage.set({
			...this.storage.value,
			channel_userlist_position: value,
		});
	}

	get navigation_bar_position()
	{
		return this.storage.get().navigation_bar_position;
	}

	set navigation_bar_position(value: LayoutData["navigation_bar_position"])
	{
		this.storage.set({
			...this.storage.value,
			navigation_bar_position: value,
		});
	}

	persist()
	{
		this.storage.set({
			channel_userlist_display: this.channel_userlist_display,
			channel_userlist_position: this.channel_userlist_position,
			navigation_bar_position: this.navigation_bar_position,
		});
	}
}

export class NotificationSettings 
{
	storage = new NotificationStorage();
	
	get sounds()
	{
		return this.storage.value.sounds;
	}
	set sounds(value: NotificationData["sounds"])
	{
		this.storage.set({ ...this.storage.value, sounds: value });
	}

	persist()
	{
		this.storage.set({
			sounds: this.storage.value.sounds,
		});
	}
}

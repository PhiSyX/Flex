// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { LayoutData } from "../localstorage/settings_layout";
import type { NotificationData } from "../localstorage/settings_notification";
import type { PersonalizationData } from "../localstorage/settings_personalization";

import { LayoutStorage } from "../localstorage/settings_layout";
import { NotificationStorage } from "../localstorage/settings_notification";
import { PersonalizationStorage } from "../localstorage/settings_personalization";

// -------------- //
// Implémentation //
// -------------- //

export class SettingsStoreData
{
	public layout: LayoutStorage = new LayoutStorage();
	public notification: NotificationStorage = new NotificationStorage();
	public personalization: PersonalizationStorage = new PersonalizationStorage();

	// ------- //
	// Méthode // -> API Publique
	// ------- //
}

export class SettingsStore
{
	// ------ //
	// Static //
	// ------ //

	static readonly NAME = "settings-store";

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(private data: SettingsStoreData)
	{
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	public get_layout()
	{
		return this.data.layout.get();
	}

	public get_notification()
	{
		return this.data.notification.get();
	}

	public get_personalization()
	{
		return this.data.personalization.get();
	}

	public mut_layout(
		set: (
			current: LayoutData
		) => LayoutData
	)
	{
		let readonly_value = this.get_layout();
		this.data.layout.value = {
			...readonly_value,
			...set(readonly_value)
		};
	}

	public mut_notification<T extends keyof NotificationData>(
		set: (
			current: NotificationData
		) => Record<T, NotificationData[T]>
	)
	{
		let readonly_value = this.get_notification();
		this.data.notification.value = {
			...readonly_value,
			...set(readonly_value)
		};
	}

	public mut_personalization<T extends keyof PersonalizationData>(
		set: (
			current: PersonalizationData
		) => Record<T, PersonalizationData[T]>
	)
	{
		let readonly_value = this.get_personalization();
		this.data.personalization.value = {
			...readonly_value,
			...set(readonly_value)
		};
	}

	public persist()
	{
		this.data.layout.persist();
		this.data.notification.persist();
		this.data.personalization.persist();
	}
}

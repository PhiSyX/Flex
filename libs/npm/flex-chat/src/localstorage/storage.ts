// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, type Option } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class AppLocalStorage<T>
{
	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		protected key: string,
		// biome-ignore lint/suspicious/noExplicitAny: ?
		reviver?: (a: string, b: string) => any | undefined,
		private with_defaults?: T,
	)
	{
		if (with_defaults) {
			this.value = with_defaults;
		}

		try {
			let item = localStorage.getItem(key);
			if (reviver) {
				if (item) {
					this.value = JSON.parse(item, reviver);
				}
			} else {
				this.value = JSON.parse(item as NonNullable<string>);
			}
		} catch {
			if (with_defaults) {
				this.value = with_defaults;
			}
		}
	}

	// --------- //
	// Propriété //
	// --------- //

	protected item: Option<T> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get value(): T
	{
		return this.get();
	}

	set value($1: NonNullable<T>)
	{
		this.set($1);
	}

	// ------- //
	// Méthode //
	// ------- //

	maybe()
	{
		return this.item;
	}

	get()
	{
		if (this.with_defaults) {
			return this.item.unwrap_or(this.with_defaults);
		}

		return this.item.expect(
			`Impossible de récupérer la clé du localStorage "${this.key}".`,
		);
	}

	save()
	{
		try {
			localStorage.setItem(this.key, JSON.stringify(this.toString()));
		} catch {}
	}

	set($1: NonNullable<T>)
	{
		if (this.with_defaults && $1 == null) {
			this.item.replace(this.with_defaults);
		} else {
			this.item.replace($1);
		}
		this.save();
	}

	toString(): string {
		return this.item.unwrap() as string;
	}
}

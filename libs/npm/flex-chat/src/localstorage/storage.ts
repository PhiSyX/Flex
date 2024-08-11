// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option } from "@phisyx/flex-safety";

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
		if (with_defaults !== undefined) {
			this.item = Option.from(with_defaults);
		}

		try {
			let item = localStorage.getItem(key);
			if (reviver) {
				if (item !== null) {
					this.value = JSON.parse(item, reviver);
				}
			} else {
				this.value = JSON.parse(item as NonNullable<string>);
			}
		} catch {
			if (with_defaults !== undefined) {
				this.item = Option.from(with_defaults);
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

	set value($1: T)
	{
		this.set($1 as NonNullable<T>);
	}

	// ------- //
	// Méthode //
	// ------- //

	maybe()
	{
		return this.item;
	}

	get(): T
	{
		if (this.item.is_none() && this.with_defaults !== undefined) {
			return this.item.unwrap_or(this.with_defaults as NonNullable<T>);
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
		if ($1 == null && this.with_defaults !== undefined) {
			this.item = Option.from(this.with_defaults);
		} else {
			this.item = Option.from($1);
		}

		this.save();
	}

	toString(): string 
	{
		return this.value as string;
	}
}

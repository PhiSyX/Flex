// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, type Option, Some } from "./option";

// ---- //
// Type //
// ---- //

type safe<T> = NonNullable<T>;
type unsafe<T> = T | null | undefined;

// ----------- //
// Énumération //
// ----------- //

export enum ResultVariant {
	Ok = "Ok",
	Err = "Err",
}

// -------------- //
// Implémentation //
// -------------- //

class Result<T, E extends Error> {
	// ------ //
	// Static //
	// ------ //

	static Err = <E extends Error>(err: E) => {
		return new Result<never, E>(ResultVariant.Err, null, err);
	};

	static Ok = <T>(value: T) => {
		if (value == null) {
			return Err(Error("null value"));
		}
		return new Result<T, never>(ResultVariant.Ok, value);
	};

	static from = <T>(value: T) => {
		if (value == null) {
			return this.Err(Error("null value"));
		}
		return this.Ok(value);
	};

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		public type: ResultVariant,
		private value?: unsafe<T>,
		private error?: E,
	) {}

	expect(msg: string): safe<T> {
		if (this.is_ok()) {
			return this.value as safe<T>;
		}
		throw new Error(`EXPECT: ${msg}`);
	}

	/**
	 * Retourne `true` si le résultat est [`Err`].
	 */
	is_err(): this is Result<never, E> {
		return this.error != null;
	}

	/**
	 * Retourne `true` si le résultat est [`Ok`].
	 */
	is_ok(): this is Result<T, never> {
		return this.value != null;
	}

	/**
	 * Convertis de `Result<T, E>` en [`Option<T>`].
	 */
	ok(): Option<safe<T>> {
		try {
			return Some(this.unwrap());
		} catch {
			return None();
		}
	}

	/**
	 * Modifie la valeur contenue dans [`Ok`].
	 */
	map<U>(f: (fn_once: safe<T>) => U): Result<U, E> {
		try {
			return Ok(f(this.unwrap())) as Result<U, E>;
		} catch {
			return Err(this.error as E);
		}
	}

	/**
	 * Retourne la valeur contenue dans [`Ok`].
	 *
	 * Cette méthode peut échouer.
	 */
	unwrap(): safe<T> {
		if (this.is_ok()) {
			return this.value as safe<T>;
		}

		const panic = (this.error?.constructor as ErrorConstructor) || Error;
		const message = this.error?.message ? `: "${this.error.message}"` : "";
		// biome-ignore lint/style/noNonNullAssertion: pas envie.
		throw new panic!(
			// biome-ignore lint/style/useTemplate: pas envie.
			"La fonction `.unwrap()` est appelée sur une valeur `Err`: " + message,
		);
	}

	/**
	 * Retourne la valeur contenue dans [`Ok`] ou une valeur par défaut
	 * si [`Err`].
	 */
	unwrap_or<X>(value_in_err_case: T | X): T | X {
		try {
			return this.unwrap();
		} catch {
			return value_in_err_case;
		}
	}

	/**
	 * Retourne la valeur contenue dans [`Ok`] ou une valeur par défaut si
	 * [`Err`].
	 */
	unwrap_or_else<X>(callback_return_value_in_err_case: (fn_once: E) => T | X): T | X {
		try {
			return this.unwrap();
		} catch {
			return callback_return_value_in_err_case(this.error as E);
		}
	}
}

const { Err, Ok } = Result;

// ------ //
// Export //
// ------ //

export { Err, Ok, Result };

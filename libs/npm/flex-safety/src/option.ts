// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// ---- //
// Type //
// ---- //

type safe<T> = NonNullable<T>;
type unsafe<T> = T | null | undefined;

// ----------- //
// Énumération //
// ----------- //

export enum OptionVariant {
	Some = "Some",
	None = "None",
}

// -------------- //
// Implémentation //
// -------------- //

class Option<T> {
	// ------ //
	// Static //
	// ------ //

	static None = <T = never>(): Option<T> => new this<T>(OptionVariant.None);

	static Some = <T>(value: T): Option<NonNullable<T>> => {
		if (value == null) {
			return None();
		}
		return new this(OptionVariant.Some, value);
	};

	static from = <T>(value: T): Option<NonNullable<T>> => {
		if (value == null) {
			return None();
		}
		return this.Some(value);
	};

	// ----------- //
	// Constructor //
	// ----------- //

	constructor(
		public type: OptionVariant,
		private value?: unsafe<T>,
	) {}

	expect(msg: string): safe<T> {
		if (this.is_some()) {
			return this.value as safe<T>;
		}
		throw new Error(`EXPECT: ${msg}`);
	}

	and_then<U>(f: (value: T) => Option<U>): Option<U> {
		if (this.is_some()) {
			return f(this.unwrap());
		}
		return None();
	}

	/**
	 * La valeur de l'option est safe.
	 */
	is_some(): this is Option<safe<T>> {
		return this.value != null;
	}

	/**
	 * La valeur de l'option n'est pas safe.
	 */
	is_none(): this is Option<never> {
		return this.value == null;
	}

	clone() {
		if (this.is_some()) {
			return Some(this.value);
		}
		return None();
	}

	/**
	 * Filtre la valeur contenue dans Some.
	 */
	filter(predicate: (value: safe<T>) => boolean): Option<T> {
		if (this.is_some()) {
			const value = this.unwrap();
			if (predicate(value)) {
				return Some(value);
			}
		}
		return None();
	}

	/**
	 * Applique une nouvelle valeur, sur la valeur contenue dans [`Some`].
	 *
	 * @example ```js
	 * Some(42).filter_map((n) => {
	 *    if (n >= 18) return Some(n * 2);
	 * 	  return None();
	 * });
	 * ```
	 */
	filter_map<U>(f: (value: safe<T>) => Option<U>): Option<U> {
		if (this.is_some()) {
			const value = this.unwrap();
			return f(value);
		}

		return None();
	}

	/**
	 * Applique une nouvelle valeur, sur la valeur contenue dans [`Some`].
	 */
	map<U>(f: (_: safe<T>) => U): Option<U> {
		try {
			return Some(f(this.unwrap()));
		} catch {
			return None();
		}
	}

	/**
	 * Applique une valeur dans le cas de `None`.
	 *
	 * @example ```js
	 * let maybe_str: Option<string> = None();
	 * maybe_str.or(Some("Hello World"));
	 * ```
	 */
	or(or_value: Option<T>): Option<T> {
		if (this.is_none()) {
			return or_value;
		}
		return this;
	}

	/**
	 * Appelle une fonction en cas de `None`.
	 *
	 * @example ```js
	 * let maybe_str: Option<string> = None();
	 * maybe_str.or_else(() => Some("Hello World"));
	 * ```
	 */
	or_else(f: () => Option<T>): Option<T> {
		if (this.is_none()) {
			return f();
		}
		return this;
	}

	/**
	 * Remplace la valeur de l'instance actuelle.
	 */
	replace<U extends safe<T>>(value: U): Option<U> {
		this.type = OptionVariant.Some;
		this.value = value;
		return this as unknown as Option<U>;
	}

	then(f: (value: T) => void) {
		if (this.is_some()) {
			f(this.unwrap());
		}
	}

	/**
	 * Retourne la valeur contenue dans [Some]
	 */
	unwrap(): safe<T> {
		const ERROR_MESSAGE: string = "La fonction `.unwrap()` est appelée sur une valeur `None`.";
		return this.expect(ERROR_MESSAGE);
	}

	/**
	 * Retourne la valeur contenue dans [Some]. Peut retourner une valeur
	 * unsafe.
	 */
	unwrap_unchecked(): T {
		return this.value as T;
	}

	/**
	 * Retourne la valeur contenue dans [Some] ou une valeur par défaut.
	 */
	unwrap_or<U>(def: safe<U>): safe<T> | safe<U> {
		try {
			return this.unwrap();
		} catch {
			return def;
		}
	}

	/**
	 * Retourne la valeur contenue dans [Some] ou une valeur par défaut avec
	 * l'utilisation d'une fonction de retour.
	 */
	unwrap_or_else<U>(fn: () => safe<U>): safe<T> | safe<U> {
		try {
			return this.unwrap();
		} catch {
			return fn();
		}
	}

	/**
	 * Combine deux Some ensemble, et retourne un tuple de taille 2 des valeurs
	 * qui sont contenues dans leur propre Some.
	 */
	zip<U>(other: Option<U>): Option<[T, U]> {
		if (this.is_some() && other.is_some()) {
			const v = this.unwrap();
			const u = other.unwrap();
			return Some([v, u]);
		}

		return None();
	}
}

const { Some, None } = Option;

// ------ //
// Export //
// ------ //

export { Option, None, Some };

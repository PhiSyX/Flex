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

type DateKeyFormat = {
	[k: string]: () => string | number;
};

// ----------- //
// Énumération //
// ----------- //

const LONG_DAYS_LANG_FR = [
	"Dimanche",
	"Lundi",
	"Mardi",
	"Mercredi",
	"Jeudi",
	"Vendredi",
	"Samedi",
] as const;

const LONG_MONTHS_LANG_FR = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre",
] as const;

const SHORT_MONTHS_LANG_FR = [
	"Jan",
	"Fév",
	"Mar",
	"Avr",
	"Mai",
	"Juin",
	"Juil",
	"Août",
	"Sept",
	"Oct",
	"Nov",
	"Déc",
] as const;

// -------- //
// Fonction //
// -------- //

/**
 * JOUR
 *
 * Représente les formats suivant:
 *
 * - `d` -> Jour du mois, sur deux chiffres (avec un zéro initial).
 *
 * - `D` -> Jour de la semaine, en trois lettres.
 *
 * - `j` -> Jour du mois sans les zéros initiaux.
 *
 * - `l` ('L' minuscule) -> Jour de la semaine, textuel, version longue.
 *
 * - `N` -> Représentation numérique ISO-8601 du jour de la semaine.
 *
 * - `S` -> Suffixe ordinal d'un nombre pour le jour du mois, en anglais, sur
 *   deux lettres. Fonctionne bien avec `j`.
 *
 * - `w` -> Jour de la semaine au format numérique. `z` -> Jour de l'année.
 */
function day_formats(this: Date): DateKeyFormat
{
	let date = this.getDate();
	let day = this.getDay();
	let year = this.getFullYear();

	return {
		/**
		 * '01' à '31'
		 */
		d: () => (date < 10 ? "0" : "") + date,

		/**
		 * 'Dim' à 'Sam'
		 */
		D: () => LONG_DAYS_LANG_FR[day].slice(0, 3),

		/**
		 * 1 à 31
		 */
		j: () => date,

		/**
		 * 'Dimanche' à 'Samedi'
		 */
		l: () => LONG_DAYS_LANG_FR[day],

		/**
		 * 1 (pour Lundi) à 7 (pour Dimanche)
		 */
		N: () => (day === 0 ? 7 : day),

		/**
		 * 1 : 'er' pour "le premier"
		 * 2 : 'd'  pour "le second"
		 * 3 : 'e'  pour "le troisième"
		 */
		S: () =>
		{
			let dm10 = date % 10;
			let one = dm10 === 1 && date !== 11;
			let two = dm10 === 2 && date !== 12;
			return one ? "er" : two ? "d" : "e";
		},

		/**
		 * 0 (pour dimanche) à 6 (pour samedi)
		 */
		w: () => day,

		/**
		 * 0 à 365
		 */
		z: () => Math.ceil((Date.now() - +new Date(year, 0, 1)) / 86400000),
	};
}

/**
 * SEMAINE
 *
 * Représente les formats suivant:
 *
 *  - `W` -> Numéro de la semaine dans l'année ISO-8601, les semaines commencent
 *    le lundi.
 *
 * @exemple 42 (la 42e semaine de l'année)
 */
function week_formats(this: Date): DateKeyFormat
{
	let day = this.getDay();

	return {
		W: () =>
		{
			let day_nr = (day + 6) % 7;

			let target = new Date(this.valueOf());
			target.setDate(target.getDate() - day_nr + 3);

			let first_thursday = target.valueOf();
			target.setMonth(0, 1);

			if (target.getDay() !== 4) {
				target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
			}

			let value = 1 + Math.ceil((first_thursday - +target) / 604800000);

			return value < 10 ? `0${value}` : value;
		},
	};
}

/**
 * MOIS
 *
 * Représente les formats suivants:
 *
 * - `F` -> Mois, textuel, version longue, comme Janvier ou Décembre.
 *
 * - `m` -> Mois au format numérique, avec zéros initiaux.
 *
 * - `M` -> Mois, en trois lettres, en anglais.
 *
 * - `n` -> Mois sans les zéros initiaux.
 *
 * - `t` -> Nombre de jours dans le mois.
 */
function month_formats(this: Date): DateKeyFormat
{
	let year = this.getFullYear();
	let month = this.getMonth();

	return {
		/**
		 * 'Janvier' à 'Décembre'
		 */
		F: () => LONG_MONTHS_LANG_FR[month],

		/**
		 * 01 à 12
		 */
		m: () => Number((month < 9 ? "0" : "") + (month + 1)),

		/**
		 * 'Jan' à 'Dec'
		 */
		M: () =>
		{
			let monthName = LONG_MONTHS_LANG_FR[month];
			let shortMonthEnds = monthName.indexOf("Jui") >= 0 ? 4 : 3;
			return monthName.slice(0, shortMonthEnds);
		},

		/**
		 * 1 à 12
		 */
		n: () => month + 1,

		/**
		 * 28 à 31
		 */
		t: () =>
		{
			let next_month = month + 1;

			if (next_month === 12) {
				year++;
				next_month = 0;
			}

			return new Date(year, next_month, 0).getDate();
		},
	};
}

/**
 * ANNÉE
 *
 * Représente les formats suivants:
 *
 * - `L` -> Année bissextile.
 *
 * - `o` -> La numérotation de semaine dans l'année ISO-8601. C'est la même
 *         valeur que `Y`, excepté si le numéro de la semaine ISO (`W`)
 *         appartient à l'année précédente ou suivante, cette année sera utilisé
 *         à la place.
 *
 * - `Y` -> Année sur 4 chiffres.
 *
 * - `y` -> Année sur 2 chiffres.
 */
function year_formats(this: Date): DateKeyFormat
{
	let year = this.getFullYear();
	let day = this.getDay();

	return {
		/**
		 * 1 si bissextile, 0 sinon.
		 */
		L: () => ~~(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)),

		o: () =>
		{
			let target = new Date(this.valueOf());
			target.setDate(target.getDate() - ((day + 6) % 7) + 3);
			return target.getFullYear();
		},

		Y: () => year,
		y: () => Number(String(year).slice(2)),
	};
}

/**
 * HEURE
 *
 * Représente les formats suivant:
 *
 * - `a` -> Ante meridiem et Post meridiem en minuscules.
 *
 * - `A` -> Ante meridiem et Post meridiem en majuscules.
 *
 * - `B` -> Heure Internet Swatch.
 *
 * - `g` -> Heure, au format 12h, sans les zéros initiaux.
 *
 * - `G` -> Heure, au format 24h, sans les zéros initiaux.
 *
 * - `h` -> Heure, au format 12h, avec les zéros initiaux.
 *
 * - `H` -> Heure, au format 24h, avec les zéros initiaux.
 *
 * - `i` -> Minutes avec les zéros initiaux.
 *
 * - `s` -> Secondes, avec zéros initiaux.
 *
 * - `u` -> Microsecondes.
 */
function hour_formats(this: Date): DateKeyFormat
{
	let hours = this.getHours();
	let minutes = this.getMinutes();
	let seconds = this.getSeconds();
	let ms = this.getMilliseconds();

	return {
		a: () => "h",

		A: () => "H",

		B: () => Math.floor(
			(((
				(this.getUTCHours() + 1) % 24)
				+ this.getUTCMinutes() / 60
				+ this.getUTCSeconds() / 3600
			) * 1000 ) / 24,
		),

		g: () => hours % 12 || 12,
		G: () => hours,
		h: () => Number(((hours % 12 || 12) < 10 ? "0" : "") + (hours % 12 || 12)),
		H: () => Number((hours < 10 ? "0" : "") + hours),
		i: () => Number((minutes < 10 ? "0" : "") + minutes),
		s: () => Number((seconds < 10 ? "0" : "") + seconds),
		u: () => Number((ms < 10 ? "00" : ms < 100 ? "0" : "") + ms),
	};
}

/**
 * FUSEAU HORAIRE
 *
 * Représente les formats suivant:
 * - `e` -> L'identifiant du fuseau horaire.
 *
 * - `I` (`i` majuscule) -> L'heure d'été est activée ou pas.
 *
 * - `O` ->  Différence d'heures avec l'heure de Greenwich (GMT), exprimée en
 *   heures.
 *
 * - `P` ->  Différence avec l'heure Greenwich (GMT) avec un deux-points entre
 *   les heures et les minutes.
 *
 * - `T` ->  Abréviation du fuseau horaire.
 *
 * - `Z` ->  Décalage horaire en secondes. Le décalage des zones à l'ouest de la
 *   zone UTC est négative, et à l'est, il est positif.
 */
function tz_formats(this: Date): DateKeyFormat
{
	let offset = this.getTimezoneOffset();
	return {
		e: () => (/\((.*)\)/.exec(new Date().toString()) || [])[1],
		
		I: () =>
		{
			let winter_offset = new Date(0).getTimezoneOffset();
			return ~~(offset !== winter_offset);
		},
		
		O: () =>
		{
			let offsetD60 = Math.abs(offset / 60);
			let offsetM60 = Math.abs(offset % 60);
			return (
				(-offset < 0 ? "-" : "+") +
				(offsetD60 < 10 ? "0" : "") +
				Math.floor(offsetD60) +
				(
					offsetM60 === 0
						? "00"
						: (offsetM60 < 10 ? "0" : "") + offsetM60
				)
			);
		},

		P: () =>
		{
			let offsetD60 = Math.abs(offset / 60);
			let offsetM60 = Math.abs(offset % 60);
			return (
				// biome-ignore lint/style/useTemplate: expression illisible sinon.
				(-offset < 0 ? "-" : "+") +
				(offsetD60 < 10 ? "0" : "") +
				Math.floor(offsetD60) +
				":" +
				(
					offsetM60 === 0
						? "00"
						: (offsetM60 < 10 ? "0" : "") + offsetM60
				)
			);
		},

		T: () => this.toTimeString().replace(/^.+ \(?([^)]+)\)?$/, "$1"),
		Z: () => offset * 60,
	};
}

/**
 * DATE ET HEURE COMPLÈTE
 *
 * Représente les formats suivant:
 *
 * - `c` -> Date au format ISO 8601.
 *
 * - `r` -> Format de date RFC 2822.
 *
 * - `U` -> Secondes depuis l'époque Unix (1er Janvier 1970, 0h00 00s GMT).
 */
function full_time_formats(this: Date): DateKeyFormat
{
	return {
		c: () => format_date("Y-m-d\\TH:i:sP", this),
		r: () => this.toString(),
		U: () => this.getTime() / 1000,
	};
}

function zero_padding(str: number | string): string
{
	let $str = String(str);
	return $str.length === 1 ? `0${$str}` : $str;
}

/**
 * Converti un objet de type Date en un format passé par le premier argument.
 */
function format_date(format = "[H:i:s]", time: Date = new Date()): string
{
	let replace_chars = {
		...day_formats.apply(time),
		...week_formats.apply(time),
		...month_formats.apply(time),
		...year_formats.apply(time),
		...hour_formats.apply(time),
		...tz_formats.apply(time),
		...full_time_formats.apply(time),
	};

	return format.replace(/(\\?)(.)/g, (_, $esc, $chr) =>
		$esc === "" && replace_chars[$chr]
			? zero_padding(replace_chars[$chr].call([]))
			: $chr,
	);
}

function get_long_month_from(
	nmonth: number,
	opt: { to_lower?: boolean } = {},
): string
{
	opt.to_lower ||= false;

	let month = LONG_MONTHS_LANG_FR.at(nmonth - 1) || "";

	if (opt.to_lower) {
		month = month.toLowerCase()
	}

	return month;
}
function get_short_month_from(
	nmonth: number,
	opt: { to_lower?: boolean } = {},
): string
{
	opt.to_lower ||= false;

	let month = SHORT_MONTHS_LANG_FR.at(nmonth - 1) || "";

	if (opt.to_lower) {
		month = month.toLowerCase()
	}

	return month;
}

// ------ //
// Export //
// ------ //

export { get_long_month_from, get_short_month_from, format_date };

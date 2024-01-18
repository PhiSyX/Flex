// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { JSX } from "vue/jsx-runtime";

// @ts-expect-error : `h` à corriger.
import { h } from "vue";
import { resolveComponent } from "vue";

// ---- //
// Type //
// ---- //

export type Icons =
	| "arrow-down"
	| "arrow-left"
	| "arrow-right"
	| "channel"
	| "close"
	| "logoff"
	| "password"
	| "plus"
	| "send"
	| "settings"
	| "text-color"
	| "url"
	| "user";

interface ButtonProps {
	disabled?: boolean;
	icon: Icons;
}

interface LabelProps {
	for: string;
	icon: Icons;
}

// -------- //
// Fonction //
// -------- //

// HACK(phisyx): Apparemment le type de `<IconName />` est incorrect :^)
function assertIcon(_value: unknown): asserts _value is string {}

export function ButtonIcon(props: ButtonProps): JSX.Element {
	const IconName = resolveComponent(`icon-${props.icon}`);
	assertIcon(IconName);
	return (
		<button disabled={props.disabled} class="btn" type="button">
			<IconName />
		</button>
	);
}

export function LabelIcon(props: LabelProps): JSX.Element {
	const IconName = resolveComponent(`icon-${props.icon}`);
	assertIcon(IconName);
	return (
		<label for={props.for}>
			<IconName />
		</label>
	);
}

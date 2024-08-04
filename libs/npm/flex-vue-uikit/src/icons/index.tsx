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

export const ICON_NAMES = [
	"arrow-down",
	"arrow-left",
	"arrow-right",
	"arrow-up",
	"channel",
	"channel-list",
	"close",
	"error",
	"event",
	"home",
	"loader",
	"logoff",
	"notice",
	"password",
	"plus",
	"report",
	"send",
	"settings",
	"text-color",
	"url",
	"user",
	"user-block",
	"users",
	"view-list",
] as const;

export type Icons = (typeof ICON_NAMES)[number];

interface ButtonProps
{
	disabled?: boolean;
	icon: Icons;
}

interface LabelProps
{
	for: string;
	icon: Icons;
}

// -------- //
// Fonction //
// -------- //

// HACK(phisyx): Apparemment le type de `<IconName />` est incorrect :^)
function assertIcon(_value: unknown): asserts _value is string
{}

export function ButtonIcon(props: ButtonProps): JSX.Element
{
	const IconName = resolveComponent(`icon-${props.icon}`);
	assertIcon(IconName);
	return (
		<button type="button" {...props} class="btn flex:shrink=0">
			<IconName />
		</button>
	);
}

export function LabelIcon(props: LabelProps): JSX.Element
{
	const { icon, ...rest } = props;
	const IconName = resolveComponent(`icon-${icon}`);
	assertIcon(IconName);
	return (
		<label {...rest}>
			<IconName />
		</label>
	);
}

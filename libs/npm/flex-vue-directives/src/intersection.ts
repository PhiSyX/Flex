// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Directive } from "vue";

// ---- //
// Type //
// ---- //

type DirectiveIntersection = Directive<
	HTMLElement & { __observer__?: IntersectionObserver },
	IntersectionObserverCallback
>;

// -------- //
// Constant //
// -------- //

/// Directive `v-intersection`.
const intersection: DirectiveIntersection = {
	mounted(el, binding) 
    {
		const observer = new IntersectionObserver(
            intersection_handler(binding.value)
        );
		observer.observe(el);
		el.__observer__ = observer;
	},

	beforeUnmount(el) 
    {
		el.__observer__?.disconnect();
	},
};

// -------- //
// Fonction //
// -------- //

// FIXME
function intersection_handler(callback: IntersectionObserverCallback)
{
	return function (
		this: IntersectionObserverCallback,
        entries: Array<IntersectionObserverEntry>,
        observer: IntersectionObserver,
	)
	{
		callback.call(this, entries, observer);
	};
}

export default intersection;

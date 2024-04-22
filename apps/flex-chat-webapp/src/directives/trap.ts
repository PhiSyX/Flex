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

import { type FocusTrap, createFocusTrap } from "focus-trap";

type DirectiveTrap = Directive<
	HTMLElement & { trap?: FocusTrap },
	boolean | undefined
>;

/// Directive `v-trap`.
///
/// Utilise la librairie [focus-trap]
const trap: DirectiveTrap = {
	mounted(el, binding, _vnode, _pnode) {
		if (binding.value) {
			el.trap = createFocusTrap(el, {
				escapeDeactivates: false,
				clickOutsideDeactivates: true,
			});
			el.trap.activate();
		}
	},

	unmounted(el) {
		el.trap?.deactivate();
		el.trap = undefined;
	},
};

export default trap;

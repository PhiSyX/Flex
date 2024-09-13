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

type DirectiveResize = Directive<
	HTMLElement & { __observer__?: ResizeObserver },
	ResizeObserverCallback
>;

/// Directive `v-resize`.
const resize: DirectiveResize = {
	mounted(el, binding) {
		let handler = binding.value;
		let observer = new ResizeObserver(resize_handler(handler));
		observer.observe(el);
		el.__observer__ = observer;
	},

	beforeUnmount(el) {
		el.__observer__?.disconnect();
	},
};

// FIXME
function resize_handler(callback: ResizeObserverCallback) {
	return function (
		this: ResizeObserver,
		entries: Array<ResizeObserverEntry>,
		observer: ResizeObserver,
	) {
		callback.call(this, entries, observer);
	};
}

export default resize;

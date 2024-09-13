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

type DirectiveMutation = Directive<
	HTMLElement & { __observer__?: MutationObserver },
	MutationCallback
>;

/// Directive `v-mutation`.
const mutation: DirectiveMutation = {
	mounted(el, binding) {
		let handler = binding.value;
		let observer = new MutationObserver(mutation_handler(handler));

		let options: MutationObserverInit = {};

		if (binding.arg === "opt") {
			if (binding.modifiers["attributes"]) {
				options.attributes = true;
			}

			if (binding.modifiers["children"]) {
				options.childList = true;
			}
		}

		observer.observe(el, options);
		el.__observer__ = observer;
	},

	beforeUnmount(el) {
		el.__observer__?.disconnect();
	},
};

// FIXME
function mutation_handler(callback: MutationCallback) {
	return function (
		this: MutationCallback,
		records: Array<MutationRecord>,
		observer: MutationObserver,
	) {
		callback.call(this, records, observer);
	};
}

export default mutation;

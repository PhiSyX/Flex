// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { customElement } from "@phisyx/flex-custom-element";
import { path, svg } from "@phisyx/flex-html-element-extension";

@customElement({ mode: "open" })
export default class IconChannel {
	render() {
		return svg(
			[24, 24],
			path(
				"M19 19H5V5h14zm0-16H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2" +
					" 0 0 0 2-2V5a2 2 0 0 0-2-2M7 9h2.31l.32-3h2l-.32 3h2l.3" +
					"2-3h2l-.32 3H17v2h-1.9l-.2 2H17v2h-2.31l-.32 3h-2l.32-3" +
					"h-2l-.32 3h-2l.32-3H7v-2h1.9l.2-2H7zm4.1 2-.2 2h2l.2-2z",
			),
		);
	}
}

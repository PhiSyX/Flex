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
import {
	animateTransform,
	circle,
	svg,
} from "@phisyx/flex-html-element-extension";

@customElement({ mode: "open" })
export default class IconLoader {
	render() {
		return svg(
			[24, 24],
			circle(
				50,
				50,
				32,
				animateTransform("transform")
					.dur("1s")
					.type("rotate")
					.repeatCount("indefinite")
					.keyTimes("0;1")
					.values("0 50 50;360 50 50"),
			)
				.fill("none")
				.strokeWidth(8)
				.strokeDashArray("50.26548245743669 50.26548245743669")
				.strokeLineCap("round")
				.stroke("#456caa"),

			circle(
				50,
				50,
				23,
				animateTransform("transform")
					.dur("1s")
					.type("rotate")
					.repeatCount("indefinite")
					.keyTimes("0;1")
					.values("0 50 50;-360 50 50"),
			)
				.fill("none")
				.strokeWidth(8)
				.strokeDashArray("36.12831551628262 36.12831551628262")
				.strokeDashOffset("36.12831551628262")
				.strokeLineCap("round")
				.stroke("#88a2ce"),
		)
			.xmlns_1999_xlink()
			.viewBox("0 0 100 100")
			.preserveAspectRatio("xMidYMid");
	}
}

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

function basename(path: string): string {
	return path.split("/").reverse()[0];
}

function defineCustomElements(imports: Record<string, CustomElementFile>) {
	for (const [fileName, { default: defineElement }] of Object.entries(
		imports,
	)) {
		const tagName = basename(fileName).slice(0, -".ts".length);
		window.customElements.define(
			tagName,
			defineElement,
			defineElement.options,
		);
	}
}

defineCustomElements(
	import.meta.glob<CustomElementFile>("./uikit/*/*-*.ts", {
		eager: true,
	}),
);
defineCustomElements(
	import.meta.glob<CustomElementFile>("./views/*/*-*.ts", {
		eager: true,
	}),
);
defineCustomElements(
	import.meta.glob<CustomElementFile>("./customElements/*-*.ts", {
		eager: true,
	}),
);

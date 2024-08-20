// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";

import type { Layer, OverlayerStore } from "../store";
import type { DialogInterface } from "./interface";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelChangeTopicLayer implements DialogInterface
{
	// ------ //
	// Static //
	// ------ //

	static ID = "channel-change-topic-layer";

	static create(
		overlayer_store: OverlayerStore,
		payload: {
			event: Event;
			linked_element: HTMLElement | undefined;
		},
	)
	{
		overlayer_store.create({
			id: ChannelChangeTopicLayer.ID,
			destroyable: "manual",
			event: payload.event,
			dom_element: payload.linked_element,
			trap_focus: false,
		});

		return new ChannelChangeTopicLayer(overlayer_store);
	}

	static destroy(overlayer_store: OverlayerStore)
	{
		overlayer_store.destroy(ChannelChangeTopicLayer.ID);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayer_store: OverlayerStore)
	{}

	// ------- //
	// Méthode //
	// ------- //

	destroy()
	{
		this.overlayer_store.destroy(ChannelChangeTopicLayer.ID);
	}

	get(): Option<Layer>
	{
		return this.overlayer_store.get(ChannelChangeTopicLayer.ID);
	}

	get_unchecked(): Layer
	{
		return this.get().unwrap_unchecked();
	}

	exists(): boolean
	{
		return this.overlayer_store.has(ChannelChangeTopicLayer.ID);
	}
}

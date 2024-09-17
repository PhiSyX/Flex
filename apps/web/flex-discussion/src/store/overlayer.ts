// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, defineAsyncComponent, reactive, readonly } from "vue";

import {
	ChangeFormatsColorsDialog,
	ChannelJoinDialog,
	ChannelSettingsDialog,
	PrivatePendingRequestDialog,
	UpdateAccountDialog,
	UserChangeNicknameDialog,
} from "@phisyx/flex-chat/dialogs";
import { ClientErrorLayer } from "@phisyx/flex-chat/layers/client_error";
import { LoadAllModulesLayer } from "@phisyx/flex-chat/layers/load_all_modules";
import { ChannelOptionsMenu } from "@phisyx/flex-chat/menu/channel_options";
import { OverlayerData, OverlayerStore } from "@phisyx/flex-chat/store";

// -------------- //
// Implémentation //
// -------------- //

class OverlayerStoreVue extends OverlayerStore {
	get layers() {
		return computed(() => readonly(this.data.layers));
	}

	get has_layers() {
		return computed(() => this.data.has_layers);
	}

	get $overlayer_mut() {
		return computed({
			get: () => this.$overlayer,
			set: ($1) => {
				this.$overlayer = $1;
			},
		});
	}

	get $teleport_mut() {
		return computed({
			get: () => this.$teleport,
			set: ($1) => {
				this.$teleport = $1;
			},
		});
	}

	get_dyn_components() {
		const ChangeFormatsColorsDialogComponent = defineAsyncComponent(
			() => import("~/components/dialog/ChangeFormatsColorsDialog.vue"),
		);
		const UserChangeNickDialogComponent = defineAsyncComponent(
			() => import("~/components/dialog/ChangeNickDialog.vue"),
		);
		const ChannelJoinDialogComponent = defineAsyncComponent(
			() => import("~/components/dialog/ChannelJoinDialog.vue"),
		);
		const ChannelSettingsDialogComponent = defineAsyncComponent(
			() => import("~/components/dialog/ChannelSettingsDialog.vue"),
		);
		const PrivatePendingRequestDialogComponent = defineAsyncComponent(
			() => import("~/components/dialog/PrivatePendingRequestDialog.vue"),
		);
		const UpdateAccountDialogComponent = defineAsyncComponent(
			() => import("~/components/dialog/UpdateAccountDialog.vue"),
		);
		const ChannelOptionsMenuComponent = defineAsyncComponent(
			() => import("~/components/menu/ChannelOptionsMenu.vue"),
		);
		const ClientErrorComponent = defineAsyncComponent(
			() => import("~/components/error/ClientError.vue"),
		);
		const ModulesProgressComponent = defineAsyncComponent(
			() => import("~/components/progress/ModulesProgress.vue"),
		);

		return Array.from(this.data.layers.keys()).map((layer_id) => {
			switch (layer_id) {
				// Dialogs

				case ChangeFormatsColorsDialog.ID:
					return ChangeFormatsColorsDialogComponent;

				case UserChangeNicknameDialog.ID:
					return UserChangeNickDialogComponent;

				case ChannelJoinDialog.ID:
					return ChannelJoinDialogComponent;

				case ChannelSettingsDialog.ID:
					return ChannelSettingsDialogComponent;

				case PrivatePendingRequestDialog.ID:
					return PrivatePendingRequestDialogComponent;

				case UpdateAccountDialog.ID:
					return UpdateAccountDialogComponent;

				// Menus

				case ChannelOptionsMenu.ID:
					return ChannelOptionsMenuComponent;

				// General
				case ClientErrorLayer.ID:
					return ClientErrorComponent;

				case LoadAllModulesLayer.ID:
					return ModulesProgressComponent;
			}

			return {
				err: `besoin de bind ${layer_id} dans get_dyn_components ;-)`,
			};
		});
	}
}

// ----- //
// Store //
// ----- //

export const use_overlayer_store = defineStore(OverlayerStore.NAME, () => {
	const store = new OverlayerStoreVue(reactive(new OverlayerData()));

	return {
		has_layers: store.has_layers,
		layers: store.layers,

		$overlayer_mut: store.$overlayer_mut,
		$teleport_mut: store.$teleport_mut,

		// -------- //
		// Redirect //
		// -------- //

		store: store as OverlayerStore,

		create: store.create.bind(store),
		destroy: store.destroy.bind(store),
		destroy_all: store.destroy_all.bind(store),
		get: store.get.bind(store),
		get_dyn_components: store.get_dyn_components.bind(store),
		get_unchecked: store.get_unchecked.bind(store),
		has: store.has.bind(store),
		update: store.update.bind(store),
		update_all: store.update_all.bind(store),
		update_data: store.update_data.bind(store),
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(
		acceptHMRUpdate(use_overlayer_store, import.meta.hot),
	);
}

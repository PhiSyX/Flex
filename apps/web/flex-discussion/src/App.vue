<script setup lang="ts">
import type { UserSession } from "@phisyx/flex-chat";

import {
	defineAsyncComponent as define_async_component,
	onMounted as on_mounted,
	ref,
	watch,
} from "vue";

import { View } from "@phisyx/flex-chat";
import { None, type Option } from "@phisyx/flex-safety";

import Overlayer from "./components/overlayer/Overlayer.vue";
import { use_theme } from "./theme";

// --------- //
// Composant //
// --------- //

defineOptions({
	components: {
		[View.Chat]: define_async_component(() => import("./views/chat/ChatView.vue")),
		[View.DirectAccess]: define_async_component(() => import("./views/direct-access/DirectAccessView.vue")),
		[View.Login]: define_async_component(() => import("./views/login/LoginView.vue")),
		[View.Settings]: define_async_component(() => import("./views/settings/SettingsView.vue")),
	},
});

let previous_view = ref();
let view = ref(View.Login);
let user = ref(None() as Option<UserSession>);

// --------- //
// Lifecycle // -> Hooks
// --------- //

use_theme();

watch(view, (_, old_view) => {
	previous_view.value = old_view;
});

on_mounted(() => {
	let fetch_options: RequestInit = { credentials: "same-origin" };

	fetch("/api/v1/users/@me", fetch_options)
		.then(async (res) => {
			if (res.ok) {
				return res.json();
			}

			if (res.status >= 400 && res.status < 600) {
				return Promise.reject(await res.json());
			}

			return Promise.reject(res);
		})
		.then((current_user: UserSession) => {
			view.value = View.DirectAccess;
			user.value.replace(current_user);
		});
});
</script>

<template>
	<div id="app">
		<KeepAlive>
			<component
				:is="view"
				v-model:change-view="view"
				:previous-view="previous_view"
				:user="user"
			/>
		</KeepAlive>

		<Overlayer />
	</div>
</template>

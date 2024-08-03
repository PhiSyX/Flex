<script setup lang="ts">
import type { UserSession } from "@phisyx/flex-chat";

import { defineAsyncComponent, onMounted, ref, watch } from "vue";

import { View } from "@phisyx/flex-chat";
import { None, type Option } from "@phisyx/flex-safety";

import Overlayer from "./components/overlayer/Overlayer.vue";
import { use_theme } from "./theme";

// --------- //
// Composant //
// --------- //

defineOptions({
	components: {
		[View.Chat]: defineAsyncComponent(
			() => import("./views/chat/ChatView.vue"),
		),
		[View.DirectAccess]: defineAsyncComponent(
			() => import("./views/direct-access/DirectAccessView.vue"),
		),
		[View.Login]: defineAsyncComponent(
			() => import("./views/login/LoginView.vue"),
		),
		[View.Settings]: defineAsyncComponent(
			() => import("./views/settings/SettingsView.vue"),
		),
	},
});

const previous_view = ref();
const view = ref(View.Login);
const user = ref(None() as Option<UserSession>);

// --------- //
// Lifecycle // -> Hooks
// --------- //

use_theme();

watch(view, (_, oldView) => {
	previous_view.value = oldView;
});

onMounted(() => {
	const fetchOpts: RequestInit = { credentials: "same-origin" };

	fetch("/api/v1/users/@me", fetchOpts)
		.then(async (res) => {
			if (res.ok) {
				return res.json();
			}

			if (res.status >= 400 && res.status < 600) {
				return Promise.reject(await res.json());
			}

			return Promise.reject(res);
		})
		.then((currentUser: UserSession) => {
			view.value = View.DirectAccess;
			user.value.replace(currentUser);
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

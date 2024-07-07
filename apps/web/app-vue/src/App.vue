<script setup lang="ts">
import type { UserSession } from "@phisyx/flex-chat";
import { None, type Option } from "@phisyx/flex-safety";
import { defineAsyncComponent, onMounted, ref, watch } from "vue";

import { View } from "./views";

import Overlayer from "./components/overlayer/Overlayer.vue";
import { useTheme } from "./theme";

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

const previousView = ref();
const view = ref(View.Login);
const user = ref(None() as Option<UserSession>);

useTheme();

onMounted(() => {
	const fetchOpts: RequestInit = { credentials: "same-origin" };

	fetch("/api/v1/users/@me", fetchOpts)
		.then(async (r) => {
			if (r.ok) return r.json();
			if (r.status >= 400 && r.status < 600)
				return Promise.reject(await r.json());
			return Promise.reject(r);
		})
		.then((currentUser: UserSession) => {
			view.value = View.DirectAccess;
			user.value.replace(currentUser);
		});
});

watch(view, (_, oldView) => {
	previousView.value = oldView;
});
</script>

<template>
	<div id="app">
		<KeepAlive>
			<component
				:is="view"
				v-model:change-view="view"
				:previous-view="previousView"
				:user="user"
			/>
		</KeepAlive>

		<Overlayer />
	</div>
</template>

<script setup lang="ts">
import { None, type Option } from "@phisyx/flex-safety";
import { defineAsyncComponent, onMounted, ref } from "vue";

import type { UserSession } from "./user/UserSession";
import { View } from "./views";

import Overlayer from "./components/overlayer/Overlayer.vue";

// ------ //
// Effect //
// ------ //

// FIXME(phisyx): dynamiser ça
document.documentElement.dataset["scheme"] = "ice";

// --------- //
// Composant //
// --------- //

defineOptions({
	components: {
		[View.Chat]: defineAsyncComponent(() => import("./views/chat/ChatView.vue")),
		[View.DirectAccess]: defineAsyncComponent(() => import("./views/direct-access/DirectAccessView.vue")),
		[View.Login]: defineAsyncComponent(() => import("./views/login/LoginView.vue")),
	},
});

const view = ref(View.Login);
const user = ref(None() as Option<UserSession>);

onMounted(() => {
	const fetchOpts: RequestInit = { credentials: "same-origin" };

	fetch("/api/v1/users/@me", fetchOpts).then(async (r) => {
		if (r.ok) return r.json();
		if (r.status >= 400 && r.status < 600) return Promise.reject(await r.json());
		return Promise.reject(r);
	}).then((currentUser: UserSession) => {
		view.value = View.DirectAccess;
		user.value.replace(currentUser);
	});
});
</script>

<template>
	<div id="app">
		<KeepAlive>
			<component :is="view" v-model:change-view="view" :user="user" />
		</KeepAlive>

		<Overlayer />
	</div>
</template>

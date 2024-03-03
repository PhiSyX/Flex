<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

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
		LoginView: defineAsyncComponent(
			() => import("./views/login/LoginView.vue")
		),
		ChatView: defineAsyncComponent(
			() => import("./views/chat/ChatView.vue")
		),
	},
});

const isUserConnected = ref(false);
</script>

<template>
	<div id="app">
		<LoginView
			key="login"
			v-if="!isUserConnected"
			v-model:is-connected="isUserConnected"
		/>
		<ChatView key="chat" v-else />

		<Overlayer />
	</div>
</template>

<script setup lang="ts">
import type { UserSession } from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

import {
	defineAsyncComponent as define_async_component,
	ref,
	watch,
} from "vue";

import { View } from "@phisyx/flex-chat";
import { None } from "@phisyx/flex-safety";

import { use_check_auth } from "./hooks/check_auth";
import { use_theme } from "./theme";

import Overlayer from "./components/overlayer/Overlayer.vue";

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
use_check_auth(view, user);

watch(view, (_, old_view) => {
	previous_view.value = old_view;
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

<script setup lang="ts">
import { use_check_auth } from "./hooks/check_auth";
import { use_theme } from "./theme";

import Overlayer from "./components/overlayer/Overlayer.vue";

// --------- //
// Lifecycle // -> Hooks
// --------- //

use_theme();
use_check_auth();
</script>

<template>
	<div id="app">
		<RouterView />
		<Overlayer />
	</div>
</template>

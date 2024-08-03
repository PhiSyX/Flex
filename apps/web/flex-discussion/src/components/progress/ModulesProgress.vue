<script setup lang="ts">
import type { Layer } from "@phisyx/flex-chat";

import { computed } from "vue";

import { useOverlayerStore } from "~/store";

// --------- //
// Composant //
// --------- //

let overlayer_store = useOverlayerStore();

let has_load_all_modules_layer = computed(() =>
	overlayer_store.layers.has("load-all-modules"),
);

let load_all_modulesLayer = computed(() => {
	return overlayer_store.get("load-all-modules") as Layer<{
		moduleName?: string;
		totalLoaded: number;
		loaded: number;
	}>;
});
</script>
<template>
	<Teleport v-if="has_load_all_modules_layer" to="#load-all-modules_teleport">
		<div
			v-if="load_all_modulesLayer && load_all_modulesLayer.data"
			class="align-t:center"
		>
			<p>
				Chargement des modules
				<output v-if="load_all_modulesLayer.data.moduleName">
					: {{ load_all_modulesLayer.data.moduleName }}
				</output>
			</p>

			<progress
				:max="load_all_modulesLayer.data.totalLoaded"
				:value="load_all_modulesLayer.data.loaded"
				class="m:a"
			>
				{{ load_all_modulesLayer.data.loaded }}%
			</progress>
		</div>
	</Teleport>
</template>

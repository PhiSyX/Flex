<script setup lang="ts">
import type { Layer } from "@phisyx/flex-chat";
import { LoadAllModulesLayer } from "@phisyx/flex-chat";

import { computed } from "vue";

import { use_overlayer_store } from "~/store";

// --------- //
// Composant //
// --------- //

let overlayer_store = use_overlayer_store();

let has_load_all_modules_layer = computed(() =>
	overlayer_store.layers.has(LoadAllModulesLayer.ID),
);

let load_all_modulesLayer = computed(() => {
	return overlayer_store.get_unchecked(LoadAllModulesLayer.ID) as Layer<{
		module_name?: string;
		total_loaded: number;
		loaded: number;
	}>;
});
</script>

<template>
	<Teleport
		v-if="has_load_all_modules_layer"
		defer
		:to="`#${LoadAllModulesLayer.ID}_teleport`"
	>
		<div
			v-if="load_all_modulesLayer && load_all_modulesLayer.data"
			class="[ align-t:center ]"
		>
			<p>
				Chargement des modules
				<output v-if="load_all_modulesLayer.data.module_name">
					: {{ load_all_modulesLayer.data.module_name }}
				</output>
			</p>

			<progress
				:max="load_all_modulesLayer.data.total_loaded"
				:value="load_all_modulesLayer.data.loaded"
				class="m:a"
			>
				{{ load_all_modulesLayer.data.loaded }}%
			</progress>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { type Layer, useOverlayerStore } from "~/store/OverlayerStore";

const overlayerStore = useOverlayerStore();

const hasLoadAllModulesLayer = computed(() => overlayerStore.layers.has("load-all-modules"));

const loadAllModulesLayer = computed(() => {
	return overlayerStore.layers.get("load-all-modules") as Layer<{
		moduleName?: string;
		totalLoaded: number;
		loaded: number;
	}>;
});
</script>
<template>
	<Teleport v-if="hasLoadAllModulesLayer" to="#load-all-modules_teleport">
		<div
			v-if="loadAllModulesLayer && loadAllModulesLayer.data"
			class="align-t:center"
		>
			<p>
				Chargement des modules
				<output v-if="loadAllModulesLayer.data.moduleName">
					: {{ loadAllModulesLayer.data.moduleName }}
				</output>
			</p>

			<progress
				:max="loadAllModulesLayer.data.totalLoaded"
				:value="loadAllModulesLayer.data.loaded"
				class="m:a"
			>
				{{ loadAllModulesLayer.data.loaded }}%
			</progress>
		</div>
	</Teleport>
</template>

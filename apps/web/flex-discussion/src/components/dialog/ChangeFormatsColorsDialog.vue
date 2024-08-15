<script setup lang="ts">
import { computed } from "vue";

import { ChangeFormatsColorsDialog } from "@phisyx/flex-chat";
import { vMutation } from "@phisyx/flex-vue-directives";

import { use_overlayer_store, use_settings_store } from "~/store";

import ChangeFormatsColorsDialogComponent from "#/sys/dialog_change_formats_colors/ChangeFormatsColorsDialog.template.vue";

// -------- //
// Constant //
// -------- //

const LAYER_NAME: string = ChangeFormatsColorsDialog.ID;

// --------- //
// Composant //
// --------- //

let overlayer_store = use_overlayer_store();
let settings_store = use_settings_store();

let dialog = computed(
	() => new ChangeFormatsColorsDialog(overlayer_store.store),
);
let has_layer = computed(() => dialog.value.exists());

let bold = computed({
	get() {
		return settings_store.personalization.formats.bold;
	},
	set($1) {
		settings_store.personalization.formats = {
			...settings_store.personalization.formats,
			bold: $1,
		};
	}
});
let italic = computed({
	get() {
		return settings_store.personalization.formats.italic;
	},
	set($1) {
		settings_store.personalization.formats = {
			...settings_store.personalization.formats,
			italic: $1,
		};
	}
});
let underline = computed({
	get() {
		return settings_store.personalization.formats.underline;
	},
	set($1) {
		settings_store.personalization.formats = {
			...settings_store.personalization.formats,
			underline: $1,
		};
	}
});

let background = computed({
	get() {
		return settings_store.personalization.colors.background;
	},
	set($1) {
		settings_store.personalization.colors = {
			...settings_store.personalization.colors,
			background: $1,
		};
	}
});
let foreground = computed({
	get() {
		return settings_store.personalization.colors.foreground;
	},
	set($1) {
		settings_store.personalization.colors = {
			...settings_store.personalization.colors,
			foreground: $1,
		};
	}
});

function mutation_handler()
{
	overlayer_store.update(LAYER_NAME);
}
</script>

<template>
	<Teleport v-if="has_layer" :to="`#${LAYER_NAME}_teleport`">
		<ChangeFormatsColorsDialogComponent 
			v-model:bold="bold"
			v-model:italic="italic"
			v-model:underline="underline"
			v-model:background="background"
			v-model:foreground="foreground"
			v-mutation:opt.attributes.children="mutation_handler"
		/>
	</Teleport>
</template>

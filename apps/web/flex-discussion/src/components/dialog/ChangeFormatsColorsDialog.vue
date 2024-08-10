<script setup lang="ts">
import { computed } from "vue";

import { ChangeFormatsColorsDialog } from "@phisyx/flex-chat";

import { vMutation } from "~/directives";
import { use_chat_store, use_overlayer_store } from "~/store";

import ChangeFormatsColorsDialogComponent from "#/sys/change_formats_colors_dialog/ChangeFormatsColorsDialog.template.vue";

// -------- //
// Constant //
// -------- //

const LAYER_NAME: string = ChangeFormatsColorsDialog.ID;

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

let dialog = computed(
	() => new ChangeFormatsColorsDialog(overlayer_store.store),
);
let has_layer = computed(() => dialog.value.exists());

let bold = computed({
	get() {
		return chat_store.store.format_bold;
	},
	set($1) {
		chat_store.store.format_bold = $1;
	}
});
let italic = computed({
	get() {
		return chat_store.store.format_italic;
	},
	set($1) {
		chat_store.store.format_italic = $1;
	}
});
let underline = computed({
	get() {
		return chat_store.store.format_underline;
	},
	set($1) {
		chat_store.store.format_underline = $1;
	}
});

let background = computed({
	get() {
		return chat_store.store.color_background;
	},
	set($1) {
		chat_store.store.color_background = $1;
	}
});
let foreground = computed({
	get() {
		return chat_store.store.color_foreground;
	},
	set($1) {
		chat_store.store.color_foreground = $1;
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

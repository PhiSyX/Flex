<script setup lang="ts">
import { ChangeFormatsColorsDialog } from "@phisyx/flex-chat";
import { vMutation } from "@phisyx/flex-vue-directives";

import { use_dialog } from "~/hooks/dialog";
import { use_settings_store } from "~/store";

import ChangeFormatsColorsDialogComponent from "#/sys/dialog_change_formats_colors/ChangeFormatsColorsDialog.template.vue";

// --------- //
// Composant //
// --------- //

let settings_store = use_settings_store();

let { teleport_id, dialog, update_dialog } = use_dialog(
	ChangeFormatsColorsDialog,
);
</script>

<template>
	<Teleport v-if="dialog.exists()" defer :to="teleport_id">
		<ChangeFormatsColorsDialogComponent
			v-model:bold="settings_store.text_format_bold_mut"
			v-model:italic="settings_store.text_format_italic_mut"
			v-model:underline="settings_store.text_format_underline_mut"
			v-model:background="settings_store.text_color_background_mut"
			v-model:foreground="settings_store.text_color_foreground_mut"
			v-mutation:opt.attributes.children="update_dialog"
		/>
	</Teleport>
</template>

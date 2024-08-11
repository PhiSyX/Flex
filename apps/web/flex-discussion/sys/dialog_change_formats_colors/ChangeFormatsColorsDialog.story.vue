<script lang="ts" setup>
import ChangeFormatsColorsDialog from "./ChangeFormatsColorsDialog.template.vue";

function init_state()
{
	return {
		background: null,
		bold: false,
		foreground: 4,
		italic: false,
		underline: false,
	}
}
</script>

<template>
	<Story title="Molecules/Dialog/ChangeFormatsColorsDialog" responsive-disabled>
		<Variant title="Default":init-state="init_state">
			<template #default="{ state }">
				<ChangeFormatsColorsDialog
					v-model:background="state.background"
					v-model:bold="state.bold"
					v-model:foreground="state.foreground"
					v-model:italic="state.italic"
					v-model:underline="state.underline"
				/>
			</template>
		</Variant>
	</Story>
</template>

<style>
#app [data-v-app] {
	width: 100vw;
	height: 100vh;
}
#app [data-v-app] > div {
	width: 100%;
	height: 100%;
	display: flex;
	place-items: center;
}
#app [data-v-app] > div > dialog {
	position: relative;
	margin: auto;
}
</style>

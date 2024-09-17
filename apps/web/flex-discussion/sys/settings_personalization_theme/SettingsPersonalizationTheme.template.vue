<script lang="ts" setup>
import type { Theme } from "@phisyx/flex-chat";

interface Props {
	selected: { name: string; src: string };
	list: Array<[name: keyof Theme, src: string]>;
}

interface Emits {
	// biome-ignore lint/style/useShorthandFunctionType: ?
	(event_name: "update", name: keyof Theme): void;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
	<div class="[ flex gap=3 w:full select:none ]">
		<div class="preview-theme">
			<img
				:src="selected.src"
				:alt="`Thème sélectionné: ${selected.name}`"
				class="[ size:full ]"
			/>
		</div>

		<div class="themes [ gap=2 ]">
			<div
				v-for="[name, src] of list"
				:class="{
					'selected-theme': selected.name === name,
				}"
				@click="$emit('update', name)"
			>
				<input
					type="image"
					:src="src"
					:alt="`Thème ${name}`"
					:title="`Thème ${name}`"
					class="[ size:full ]"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

.themes {
	display: grid;
	grid-template-columns: repeat(3, fx.space(120));

	div {
		overflow: clip;
		border-radius: 8px;
	}

	img {
		border-radius: 8px;
	}
}

.selected-theme {
	border: 3px solid var(--color-orange700);
}

.preview-theme {
	height: fx.space(200);
	width: fx.space(280);
	border-radius: 8px;
	border: 8px solid var(--color-blue-grey800);
}

input[type="image"]:focus {
	border: 3px solid var(--color-yellow700);
}
</style>

<script lang="ts" setup>
import { onActivated, shallowRef } from "vue";

import {
	THEMES,
	type Theme,
	type ThemeRecord,
	findTheme,
	setThemeLS,
} from "~/theme";

const themes = Object.entries(THEMES) as Array<
	[ThemeRecord["name"], ThemeRecord["src"]]
>;
const selectedTheme = shallowRef(findTheme());

function updateTheme(name: keyof Theme) {
	setThemeLS(name);
	selectedTheme.value = findTheme();
}

onActivated(() => {
	selectedTheme.value = findTheme();
});
</script>

<template>
	<h2>Choisir son thème</h2>
	<div class="[ flex gap=3 w:full select:none ]">
		<div class="preview-theme">
			<img
				:src="selectedTheme.src"
				:alt="`Thème sélectionné: ${selectedTheme.name}`"
				class="[ size:full ]"
			/>
		</div>

		<div class="themes [ gap=2 ]">
			<div
				v-for="[name, src] of themes"
				:class="{
					'selected-theme': selectedTheme.name === name,
				}"
				@click="updateTheme(name)"
			>
				<img
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
</style>

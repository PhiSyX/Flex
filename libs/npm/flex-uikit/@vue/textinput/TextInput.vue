<script setup lang="ts">
import type { TextInputChildren } from "@phisyx/flex-uikit/textinput/children";
import type { TextInputProps } from "@phisyx/flex-uikit/textinput/props";

import LabelIcon from "../label/LabelIcon.vue";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
defineProps<TextInputProps>();
defineSlots<TextInputChildren>();

let input_model = defineModel<string>();
</script>

<template>
	<div class="fx:textinput [ flex! gap=1 py=1 ]" :class="{ error: error }">
		<div class="[ flex align-ji:center gap=1 ]">
			<slot name="icon">
				<LabelIcon :for="name" :icon="label" />
			</slot>
			<input
				:id="name"
				v-model="input_model"
				type="text"
				v-bind="$attrs"
			/>
			<slot />
		</div>
		<p v-if="error" class="[ p:reset ml=4 f-size=13px ]">
			<em>{{ error }}</em>
		</p>
	</div>
</template>

<style scoped lang="scss">
@use "@phisyx/flex-uikit-stylesheets/textinput/TextInput.scss";
</style>

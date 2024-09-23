<script setup lang="ts">
import type { InputSwitchChildren } from "@phisyx/flex-uikit/input/children";
import type { InputSwitchEmits } from "@phisyx/flex-uikit/input/emits";
import type { InputSwitchProps } from "@phisyx/flex-uikit/input/props";

import { input_switch_state } from "@phisyx/flex-uikit/input/presenter";
import { computed, watchEffect } from "vue";

const { disabled, position = "left" } = defineProps<InputSwitchProps>();
const emit = defineEmits<InputSwitchEmits>();
defineSlots<InputSwitchChildren>();

let input_model = defineModel();

let title_attribute = computed(() =>
	input_switch_state(input_model.value, disabled)
);

watchEffect(() => {
	if (input_model.value) {
		emit("on");
	} else {
		emit("off");
	}
});
</script>

<template>
	<label
		:for="name"
		class="fx:inputswitch [ pos-r i-flex align-i:center align-v:middle gap=2 ]"
		:class="{
			'cursor:default': disabled,
		}"
		:title="title_attribute"
	>
		<input
			:disabled="disabled"
			:id="name"
			:name="name"
			type="checkbox"
			class="[ size=0 vis:h ]"
			role="switch"
			style="position: absolute"
			v-model="input_model"
		/>

		<span
			class="fx:inputswitch:control [ pos-r i-flex flex/center:full w=5 h=2 border/radius=1 ]"
			:style="{
				order: position === 'right' ? 1 : undefined,
			}"
		>
			<span
				class="fx:inputswitch:thumb [ size=3 border/radius=50 ]"
			></span>
		</span>

		<p class="fx:inputswitch:label [ p:reset select:none ]">
			<slot />
		</p>
	</label>
</template>

<style scoped lang="scss">
@import "@phisyx/flex-uikit-stylesheets/input/InputSwitch.scss";
</style>

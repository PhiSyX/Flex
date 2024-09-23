<script setup lang="ts">
import type { InputLabelSwitchChildren } from "@phisyx/flex-uikit/input/children";
import type { InputLabelSwitchProps } from "@phisyx/flex-uikit/input/props";

import {
	DEFAULT_LABEL_NO,
	DEFAULT_LABEL_YES,
} from "@phisyx/flex-uikit/input/presenter";
import { computed } from "vue";

// --------- //
// Composant //
// --------- //

const {
	name,
	valueY = true,
	valueN = false,
	labelY = DEFAULT_LABEL_YES,
	labelN = DEFAULT_LABEL_NO,
} = defineProps<InputLabelSwitchProps>();

defineSlots<InputLabelSwitchChildren>();

let input_model = defineModel();
let unique_id = computed(() => name);
let input_attr_id = computed(() => `radio_${unique_id.value}`);
let input_attr_id_yes = computed(() => `${input_attr_id}_y`);
let input_attr_id_no = computed(() => `${input_attr_id}_n`);
</script>

<template>
	<div class="fx:inputlabelswitch">
		<slot />

		<ol class="[ pos-r i-flex ]">
			<li class="[ pos-r display-ib ]">
				<input
					:id="input_attr_id_yes"
					v-model="input_model"
					:form="form"
					:name="name"
					:value="valueY"
					type="radio"
				/>

				<label
					:for="input_attr_id_yes"
					class="[ pos-r display-b f-size=14px align-t:center cursor:pointer select:none ]"
				>
					{{ labelY }}
				</label>
			</li>

			<li class="[ pos-r display-ib ]">
				<input
					:id="input_attr_id_no"
					v-model="input_model"
					:form="form"
					:name="name"
					:value="valueN"
					type="radio"
				/>

				<label
					:for="input_attr_id_no"
					class="[ pos-r display-b f-size=14px align-t:center cursor:pointer select:none ]"
				>
					{{ labelN }}
				</label>

				<div aria-hidden="true" class="fx:inputlabelswitch/marker"></div>
			</li>
		</ol>
	</div>
</template>

<style scoped lang="scss">
@import "@phisyx/flex-uikit-stylesheets/input/InputLabelSwitch.scss";
</style>

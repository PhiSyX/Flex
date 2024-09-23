<script lang="ts" setup>
import InputLabelSwitch from "@phisyx/flex-uikit-vue/input/InputLabelSwitch.vue";
import InputSwitch from "@phisyx/flex-uikit-vue/input/InputSwitch.vue";

import { ref } from "vue";

let model = ref();
</script>

<template>
	<Story title="Atoms/InputSwitch" responsive-disabled>
		<Variant title="Version 1">
			<InputLabelSwitch
				v-model="model"
				label-n="Non"
				label-y="Oui"
				name="remember_me"
			/>
		</Variant>

		<Variant title="Version 2">
			<div style="margin: 40px">
				<InputSwitch
					v-model="model"
					name="remember_me"
				/>
			</div>
		</Variant>
	</Story>
</template>

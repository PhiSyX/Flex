<script lang="ts" setup>
import { InputSwitch, InputSwitchV2 } from "@phisyx/flex-vue-uikit";
import { ref } from "vue";

let model = ref();
</script>

<template>
	<Story title="Atoms/InputSwitch" responsive-disabled>
		<Variant title="Version 1">
			<InputSwitch
				v-model="model"
				label-n="Non"
				label-y="Oui"
				name="remember_me"
			/>
		</Variant>

		<Variant title="Version 2">
			<div style="margin: 40px">
				<InputSwitchV2
					v-model="model"
					name="remember_me"
				/>
			</div>
		</Variant>
	</Story>
</template>

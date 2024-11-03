<script setup lang="ts">
import type { FormLinkEmits } from "@phisyx/flex-uikit/form/emits";
import type { FormLinkProps } from "@phisyx/flex-uikit/form/props";

import { submit_form_link } from "@phisyx/flex-uikit/form/handler";

import { useTemplateRef } from "vue";

const { href, method } = defineProps<FormLinkProps>();
const emit = defineEmits<FormLinkEmits>();

let $form = useTemplateRef("$form");

// ------- //
// Handler //
// ------- //

const submit_handler = (evt: Event) =>
	submit_form_link(evt, emit, {
		el: $form.value,
		action: href,
		method: method,
	});
</script>

<template>
	<form
		ref="$form"
		:action="href"
		:method="method"
		@submit="submit_handler"
		class="fx:form-link"
	>
		<input
			v-if="data"
			v-for="[k, v] of Object.entries(data)"
			type="hidden"
			:name="k"
			:value="v"
		/>

		<a
			:href="href"
			class="[ button:reset px=1 cursor:pointer ]"
			@click="submit_handler"
		>
			<slot />
		</a>
	</form>
</template>

<style lang="scss" scoped>
@use "@phisyx/flex-uikit-stylesheets/form/FormLink.scss";
</style>

<script setup lang="ts">
import type { AlertEmits } from "@phisyx/flex-uikit/alert/emits";
import type { AlertProps } from "@phisyx/flex-uikit/alert/props";

import {
	DEFAULT_LABEL_CANCEL,
	DEFAULT_LABEL_NO,
	DEFAULT_LABEL_OK,
	DEFAULT_LABEL_YES,
	make_alert_buttons,
} from "@phisyx/flex-uikit/alert/buttons";
import { make_alert_type } from "@phisyx/flex-uikit/alert/types";
import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue";

import ButtonIcon from "../button/ButtonIcon.vue";
import Panel from "../panel/Panel.vue";

const {
	closable = true,
	closeAfterSeconds,
	contentAlign = "left",
	buttons = 0,
	buttonsBar = true,
	buttonLabels = {
		cancel: DEFAULT_LABEL_CANCEL,
		no: DEFAULT_LABEL_NO,
		ok: DEFAULT_LABEL_OK,
		yes: DEFAULT_LABEL_YES,
	},
	type,
} = defineProps<AlertProps>();
const emit = defineEmits<AlertEmits>();

let auto_destroyed = shallowRef(true);

let $buttons = computed(() =>
	make_alert_buttons(
		buttons,
		buttonLabels as Required<NonNullable<AlertProps["buttonLabels"]>>,
		emit,
	),
);

let alert_type = computed(() => make_alert_type(type));

// ------- //
// Handler //
// ------- //

function close_handler() {
	auto_destroyed.value = false;
	emit("close");
}

// ---------- //
// Life cycle // -> Hooks
// ---------- //

if (closeAfterSeconds) {
	let timeout: number;

	onMounted(() => {
		timeout = setTimeout(() => {
			close_handler();
		}, closeAfterSeconds * 1_000);
	});

	onBeforeUnmount(() => {
		clearTimeout(timeout);
	});
}
</script>

<template>
	<div
		v-if="auto_destroyed"
		:class="{
			[`fx:alert/${alert_type}`]: alert_type,
			[`align-t:${contentAlign}`]: contentAlign,
		}"
		class="fx:alert"
	>
		<Panel class="fx:alert/panel" :base-padding="false">
			<div
				class="[ ov:c flex align-ji:center gap=1 select:none f-size=13px ]"
			>
				<div class="[ flex:full p:reset p=1 ]">
					<slot />
				</div>

				<ButtonIcon
					v-if="closable"
					icon="close"
					class="fx:alert/close [ button:reset cursor:pointer flex:shrink=0 ]"
					@click="close_handler"
				/>
			</div>

			<template #footer v-if="buttons">
				<footer
					class="[ gap=1 ]"
					:class="{
						'flex align-jc:center': buttonsBar,
						'flex!': !buttonsBar,
					}"
				>
					<button
						v-for="button of $buttons"
						:key="button.label"
						type="button"
						class="fx:alert/button [ cursor:pointer ]"
						@click="button.handler"
					>
						{{ button.label }}
					</button>
				</footer>
			</template>
		</Panel>
	</div>
</template>

<style scoped lang="scss">
@import "@phisyx/flex-uikit-stylesheets/alert/Alert.scss";
</style>

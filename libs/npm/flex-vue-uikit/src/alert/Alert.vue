<script lang="ts">
export enum AlertButtonFlag {
	YES = 0x0001,
	NO = 0x0002,
	OK = 0x0004,
	CANCEL = 0x0008,
}
</script>

<script setup lang="ts">
import { ButtonHTMLAttributes, computed, onMounted, ref } from "vue";

import { ButtonIcon } from "../icons";
import Panel, { PanelFooterPosition } from "../panel/Panel.vue";

// ---- //
// Type //
// ---- //

type ButtonFlags = number;

interface Props {
	canClose?: boolean;
	contentCenter?: boolean;
	closeAfterSeconds?: number;
	type: "warning" | "error";

	buttons?: ButtonFlags;

	cancelLabel?: string;
	noLabel?: string;
	okLabel?: string;
	yesLabel?: string;
}

interface Emits {
	(event_name: "cancel"): void;
	(event_name: "close"): void;
	(event_name: "no"): void;
	(event_name: "ok"): void;
	(event_name: "yes"): void;
}

interface Slots {
	default: unknown;
}

// --------- //
// Composant //
// --------- //

const {
	canClose = true,
	contentCenter = true,
	closeAfterSeconds,
	buttons,
	cancelLabel = "Annuler",
	okLabel = "OK",
	noLabel = "Non",
	yesLabel = "Oui",
} = defineProps<Props>();
const emit = defineEmits<Emits>();
defineSlots<Slots>();

let $buttons = computed(() => {
	if (!buttons) {
		return [];
	}

	let buttons_temp: Array<{
		label: string;
		type: ButtonHTMLAttributes["type"];
		cb: () => void;
	}> = [];

	if (buttons & AlertButtonFlag.YES) {
		buttons_temp.push({
			label: yesLabel,
			type: "button",
			cb: () => emit("yes"),
		});
	}
	if (buttons & AlertButtonFlag.NO) {
		buttons_temp.push({
			label: noLabel,
			type: "button",
			cb: () => emit("no"),
		});
	}
	if (buttons & AlertButtonFlag.OK) {
		buttons_temp.push({
			label: okLabel,
			type: "button",
			cb: () => emit("ok"),
		});
	}
	if (buttons & AlertButtonFlag.CANCEL) {
		buttons_temp.push({
			label: cancelLabel,
			type: "button",
			cb: () => emit("cancel"),
		});
	}

	return buttons_temp;
});
let displaying = ref(true);

// --------- //
// Lifecycle //
// --------- //

onMounted(() => {
	if (closeAfterSeconds) {
		setTimeout(() => {
			close_handler();
		}, closeAfterSeconds * 1000);
	}
});

// ------- //
// Handler //
// ------- //

function close_handler() {
	displaying.value = false;
	emit("close");
}
</script>

<template>
	<Panel
		v-if="displaying"
		inline-footer
		:footer-position="PanelFooterPosition.Center"
		class="alert"
		:class="{
			'align-t:center': contentCenter,
			[`alert/${type}`]: true,
		}"
	>
		<div
			class="[ ov:c flex align-ji:center gap=1 select:none f-size=13px ]"
		>
			<div class="[ flex:full p:reset p=1 ]">
				<slot />
			</div>

			<ButtonIcon
				v-if="canClose"
				icon="close"
				class="[ flex:shrink=0 ]"
				@click="close_handler"
			/>
		</div>

		<template #footer v-if="buttons">
			<button
				v-for="button of $buttons"
				:key="button.label"
				:type="button.type"
				class="alert/button [ cursor:pointer ]"
				@click="button.cb"
			>
				{{ button.label }}
			</button>
		</template>
	</Panel>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

.alert {
	border: 1px solid var(--alert-border-color);
	color: currentColor;
}

@include fx.class("alert/button") {
	border: 1px solid var(--alert-border-color);
	background: var(--alert-button-bg);
	padding-block: 4px;
	padding-inline: fx.space(1);
	border-radius: 3px;
}

@include fx.class("alert/warning") {
	@include fx.scheme using ($name) {
		@if $name == light {
			--panel-color: #a27718;
			--panel-bg: #ffffcb;
			--alert-border-color: #ffd133;
			--alert-button-bg: var(--color-ultra-white);
		} @else if $name == ice {
			--panel-color: #50a097;
			--panel-bg: #ccfff9;
			--alert-border-color: #50a097;
			--alert-button-bg: var(--color-ultra-white);
		} @else if $name == dark {
			--alert-border-color: #ffd133;
			--panel-color: #a27718;
			--panel-bg: #ffffcb;
			--alert-button-bg: var(--color-ultra-white);
		}
	}
}

@include fx.class("alert/error") {
	@include fx.scheme using ($name) {
		@if $name == light {
			--panel-color: var(--color-red700);
			--panel-bg: var(--color-red200);
			--alert-border-color: var(--color-red600);
			--alert-button-bg: var(--color-ultra-white);
		} @else if $name == ice {
			--panel-color: var(--color-white);
			--panel-bg: var(--color-red400);
			--alert-border-color: var(--color-red300);
			--alert-button-bg: var(--color-ultra-white);
		} @else if $name == dark {
			--panel-color: var(--color-white);
			--panel-bg: var(--color-red400);
			--alert-border-color: var(--color-red300);
			--alert-button-bg: var(--color-ultra-white);
		}
	}
}
</style>

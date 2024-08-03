<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ButtonIcon } from "../icons";

// ---- //
// Type //
// ---- //

interface Props {
	canClose?: boolean;
	contentCenter?: boolean;
	closeAfterSeconds?: number;
	type: "warning" | "error";
}

interface Emits {
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(event_name: "close"): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	canClose: true,
	contentCenter: true,
});
const emit = defineEmits<Emits>();

const displaying = ref(true);

function closeHandler() {
	displaying.value = false;
	emit("close");
}

onMounted(() => {
	if (props.closeAfterSeconds) {
		setTimeout(() => {
			closeHandler();
		}, props.closeAfterSeconds * 1000);
	}
});
</script>

<template>
	<div
		class="alert [ ov:c flex align-ji:center gap=1 p=2 select:none ]"
		:class="{
			'align-t:center': contentCenter,
			[`alert/${type}`]: true,
		}"
		v-if="displaying"
	>
		<div class="[ flex:full ]"><slot /></div>

		<ButtonIcon
			v-if="canClose"
			icon="close"
			class="[ flex:shrink=0 ]"
			@click="closeHandler"
		/>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

.alert {
	font-size: 13px;
	border: 1px solid transparent;
	color: currentColor;
}

@include fx.class("alert/warning") {
	@include fx.scheme using ($name) {
		@if $name == light {
			border-color: #ffd133;
			color: #a27718;
			background-color: #ffffcb;
		} @else if $name == ice {
			border-color: #50a097;
			color: #50a097;
			background-color: #ccfff9;
		} @else if $name == dark {
			border-color: #ffd133;
			color: #a27718;
			background-color: #ffffcb;
		}
	}
}

@include fx.class("alert/error") {
	@include fx.scheme using ($name) {
		@if $name == light {
			border-color: var(--color-red600);
			color: var(--color-red700);
			background-color: var(--color-red200);
		} @else if $name == ice {
			border-color: var(--color-red300);
			color: var(--color-white);
			background-color: var(--color-red400);
		} @else if $name == dark {
			border-color: var(--color-red300);
			color: var(--color-white);
			background-color: var(--color-red400);
		}
	}
}
</style>

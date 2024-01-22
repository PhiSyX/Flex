<script setup lang="ts">
import { ref } from "vue";
import { ButtonIcon } from "../icons";

// ---- //
// Type //
// ---- //

interface Props {
	canClose?: boolean;
	type: "warning";
	contentCenter?: boolean;
}

interface Emits {
	(evtName: "close"): void;
}

// --------- //
// Composant //
// --------- //

withDefaults(defineProps<Props>(), {
	canClose: true,
	contentCenter: true,
});
const emit = defineEmits<Emits>();

const displaying = ref(true);

function closeHandler() {
	displaying.value = false;
	emit("close");
}
</script>

<template>
	<div
		class="alert"
		:class="{
			'alert:center': contentCenter,
			[`alert/${type}`]: true,
		}"
		v-if="displaying"
	>
		<p><slot /></p>

		<ButtonIcon v-if="canClose" icon="close" @click="closeHandler" />
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

.alert {
	overflow: clip;

	display: flex;
	place-items: center;

	font-size: 13px;
	padding: fx.space(2);
	border: 1px solid transparent;
	color: currentColor;
	user-select: none;

	p {
		flex-grow: 1;
		margin-block: 0;
	}
}

@include fx.class("alert:center") {
	text-align: center;
}

@include fx.class("alert/warning") {
	border-color: #50a097;
	color: #50a097;
	background-color: #ccfff9;
}
</style>

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
	type: "warning";
}

interface Emits {
	(evtName: "close"): void;
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
		class="alert [ ov:c flex align-ji:center p=2 select:none ]"
		:class="{
			'align-t:center': contentCenter,
			[`alert/${type}`]: true,
		}"
		v-if="displaying"
	>
		<p class="[ flex:full my=0 ]"><slot /></p>

		<ButtonIcon v-if="canClose" icon="close" @click="closeHandler" />
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
	@include fx.theme using ($name) {
		@if $name == light {
			border-color: #ffd133;
			color: #a27718;
			background-color: #ffffcb;
		} @else if $name == ice {
			border-color: #50a097;
			color: #50a097;
			background-color: #ccfff9;
		}
	}
}
</style>

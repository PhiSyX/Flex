<script setup lang="ts">
import { shallowRef as shallow_ref, watchEffect as watch_effect } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	src: string;
	autoplay?: boolean;
}

interface Emits {
	// biome-ignore lint/style/useShorthandFunctionType: ;-)
	(event_name: "ended"): void;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	autoplay: false,
});
const emit = defineEmits<Emits>();

let $root = shallow_ref<HTMLAudioElement>();

function play() {
	if (!$root.value) {
		return;
	}

	$root.value.play();
}

function reset() {
	if (!$root.value) {
		return;
	}

	$root.value.currentTime = 0;
	emit("ended");
}

watch_effect(() => {
	if (props.autoplay) {
		play();
	}
});
</script>

<template>
	<audio ref="$root" :src="src" :autoplay="autoplay" @pause="reset" />
</template>

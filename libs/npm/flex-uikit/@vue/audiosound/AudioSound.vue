<script setup lang="ts">
import type { AudioSoundEmits } from "@phisyx/flex-uikit/audiosound/emits";
import type { AudioSoundProps } from "@phisyx/flex-uikit/audiosound/props";

import { useTemplateRef, watchEffect } from "vue";

const { autoplay = false } = defineProps<AudioSoundProps>();

const emit = defineEmits<AudioSoundEmits>();

let $root = useTemplateRef("$root");

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

watchEffect(() => {
	if (autoplay) {
		play();
	}
});
</script>

<template>
	<audio
		ref="$root"
		:src="src"
		:autoplay="autoplay"
		class="fx:audiosound"
		@pause="reset"
	/>
</template>

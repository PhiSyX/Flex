<script setup lang="ts">
import { computed } from "vue";

import { UiImage } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props
{
    alt?: HTMLImageElement["alt"];
	id: string;
    vertical?: boolean;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
    vertical: false,
});

let image_url = computed(() => `/api/v1/avatars/${props.id}`);
let image_alt = computed(() => props.alt || `Avatar #${props.id}`);
</script>

<template>
    <UiImage
        :src="image_url"
        :alt="image_alt"
        :rounded="true"
        :text-inline="!vertical"
        size="3"
    >
        <slot />
    </UiImage>
</template>
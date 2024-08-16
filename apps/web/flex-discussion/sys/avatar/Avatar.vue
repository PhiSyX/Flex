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
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

let image_url = computed(() => `/api/v1/avatars/${props.id}`);
let image_alt = computed(() => props.alt || `Avatar #${props.id}`);
</script>

<template>
    <UiImage
        :src="image_url"
        :alt="image_alt"
        :rounded="true"
        size="3"
    />
</template>
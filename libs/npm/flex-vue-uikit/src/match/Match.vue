<script setup lang="ts" generic="T">
import type { Option } from "@phisyx/flex-safety";

import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	maybe: Option<T>;
	clone?: boolean;
}

interface Slots {
	some?: (props: { data: NonNullable<T> }) => NonNullable<T>;
	none?: (props: unknown) => unknown;
}

// --------- //
// Composant //
// --------- //

const { clone = false, maybe } = defineProps<Props>();
defineSlots<Slots>();

let maybe_data = computed(() => (clone ? maybe.clone() : maybe));
</script>

<template>
	<slot v-if="maybe_data.is_some()" v-bind:data="maybe_data.unwrap()" name="some" />
	<slot v-else name="none" />
</template>

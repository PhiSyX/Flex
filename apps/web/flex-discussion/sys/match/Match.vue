<script setup lang="ts" generic="T">
import type { Option } from "@phisyx/flex-safety";

// ---- //
// Type //
// ---- //

interface Props
{
	maybe: Option<T>;
}

interface Slots
{
	some?: (props: { data: NonNullable<T> }) => NonNullable<T>;
	none?: (props: unknown) => unknown;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
defineSlots<Slots>();
</script>

<template>
	<slot v-if="maybe.is_some()" v-bind:data="maybe.unwrap()" name="some" />
	<slot v-else name="none" />
</template>

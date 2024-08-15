<script setup lang="ts" generic="T">
import type { Option } from "@phisyx/flex-safety";
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props
{
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

const props= withDefaults(defineProps<Props>(), { clone: false });
defineSlots<Slots>();

let maybe = computed(
	() => props.clone && props.maybe.is_some() 
		? props.maybe.clone() 
		: props.maybe
);
</script>

<template>
	<slot v-if="maybe.is_some()" v-bind:data="maybe.unwrap()" name="some" />
	<slot v-else name="none" />
</template>

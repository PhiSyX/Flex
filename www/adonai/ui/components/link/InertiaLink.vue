<script setup lang="ts">
import type { InertiaLinkProps } from "@inertiajs/vue3";
import type { Icons } from "@phisyx/flex-uikit/icons.ts";

import { Link, usePage } from "@inertiajs/vue3";
import { computed } from "vue";

interface Props {
	icon?: Icons;
	href: InertiaLinkProps["href"];
	method?: InertiaLinkProps["method"];
	as?: InertiaLinkProps["as"];
	strict?: boolean;
	hideWhenActive?: boolean;
}

const {
	as,
	method = "get",
	hideWhenActive,
	href,
	strict,
} = defineProps<Props>();

let current_page = usePage();

let is_active_page = computed(() => {
	if (strict) {
		return current_page.url === href;
	}
	return current_page.url.indexOf(href) >= 0;
});

let display_if_active = computed(() => {
	if (!hideWhenActive) {
		return true;
	}
	return !is_active_page.value;
});

let native_link = computed(() => (method !== "get" ? "button" : as));

let title = computed(() => {
	if (method === "get") {
		return `Navigue vers: ${href}`;
	}
	return `Navigue vers: ${href} (${method})`;
});
</script>

<template>
	<Link
		v-if="display_if_active"
		:as="native_link"
		:href="href"
		:method="method"
		:class="{ active: is_active_page }"
		:title="title"
	>
		<component v-if="icon" :is="`icon-${icon}`" />
		<slot />
	</Link>
</template>

<style scoped>
button {
	background-color: transparent;
	border: none;
	cursor: pointer;
}

a,
button {
	color: currentColor;
}

.active svg {
	filter: drop-shadow(1px 1px 4px currentColor);
}
</style>

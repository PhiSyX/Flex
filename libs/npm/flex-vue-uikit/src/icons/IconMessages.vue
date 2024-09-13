<script setup lang="ts">
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	unread?: number;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
let title = computed(() =>
	props.unread ? `${props.unread} non lu` : undefined,
);
</script>

<template>
	<span class="[ pos-r ]">
		<strong
            v-if="unread"
            class="[ f-size=10px border/radius:full ]"
			 :aria-title="title"
        >
            {{ unread }}
        </strong>

		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M14.1667 10.7452V3.2452C14.1667 3.02418 14.0789 2.81222 13.9226 2.65594C13.7663 2.49966 13.5543 2.41187 13.3333 2.41187H2.5C2.27898 2.41187 2.06702 2.49966 1.91074 2.65594C1.75446 2.81222 1.66666 3.02418 1.66666 3.2452V14.9119L5 11.5785H13.3333C13.5543 11.5785 13.7663 11.4907 13.9226 11.3345C14.0789 11.1782 14.1667 10.9662 14.1667 10.7452ZM17.5 5.7452H15.8333V13.2452H5V14.9119C5 15.1329 5.0878 15.3448 5.24408 15.5011C5.40036 15.6574 5.61232 15.7452 5.83333 15.7452H15L18.3333 19.0785V6.57853C18.3333 6.35752 18.2455 6.14556 18.0893 5.98928C17.933 5.833 17.721 5.7452 17.5 5.7452Z"
				fill="currentColor"
				fill-opacity="0.5"
			/>
		</svg>
	</span>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

strong {
    position: absolute;
    top: -10px;
    right: -2px;
	padding-inline: 6px;
	padding-block: 4px;

	@include fx.scheme using ($name) {
		@if $name == dark {
			background-color: var(--color-red500);
		} @else if $name == light {
			background-color: var(--color-cyan800);
			color: var(--color-white);
		}
	}
}
</style>

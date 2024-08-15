<script lang="ts">
const IMAGE_FALLBACK = "/public/img/default-avatar.png";
const IMAGE_SIZE_FALLBACK = "4"; // 8 * 4
const IMAGE_CACHE = new Map<string, {
	expires: Date,
	loaded: boolean;
	source: string;
}>();
const IMAGE_CACHE_MINUTE = import.meta.env.DEV ? 1 : 30;
</script>

<script setup lang="ts">
import { computed, ref } from "vue";

import { Some } from "@phisyx/flex-safety";
import { vIntersection } from "@phisyx/flex-vue-directives";

import Match from "../match/Match.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	alt?: HTMLImageElement["alt"];
	src: HTMLImageElement["src"];
	size?: string | number;
	rounded?: boolean;
	cover?: boolean;
	fallback?: string;
	prefixed?: boolean;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	cover: true,
	fallback: IMAGE_FALLBACK,
	prefixed: true,
});

let size = computed(
	() => Number.parseInt(props.size?.toString() || IMAGE_SIZE_FALLBACK, 10)
);
let size_attribute = computed(() => size.value * 8);

// NOTE: ne charger l'image qu'une fois l'élément visible à l'écran.
let intersected = ref(false);
let loaded = ref(false);

let $image = ref<HTMLDivElement>();

let source = computed(() => {
	if (IMAGE_CACHE.has(props.src)) {
		let img = IMAGE_CACHE.get(props.src);
		if (img) {
			if (img.expires.getTime() > Date.now()) {
				return Some(img.source);
			}

			if (img.loaded) {
				return Some(img.source);
			}
		}
	}

	let img_src = intersected.value
		? props.src
		: props.fallback;

	if (img_src !== props.fallback) {
		let expires = new Date();
		let current_minute = expires.getMinutes();
		expires.setMinutes(current_minute + IMAGE_CACHE_MINUTE);
		
		IMAGE_CACHE.set(props.src, {
			expires,
			loaded: false,
			source: img_src,
		});
	}
	
	return Some(img_src);
});

// ------- //
// Handler //
// ------ //

function load_image_handler(_: Event)
{
	loaded.value = $image.value?.getAttribute("src") !== props.fallback;

	let img = IMAGE_CACHE.get(props.src);
	if (img) {
		img.loaded = loaded.value;
	}
}

function error_fallback_handler(_: Event)
{
	intersected.value = false;

	let img = IMAGE_CACHE.get(props.src);
	if (img) {
		img.loaded = false;
		img.source = props.fallback;
	}
}

function intersect_handler(
	this: IntersectionObserver,
	entries: Array<IntersectionObserverEntry>,
)
{
	let [image] = entries;

	if (image.isIntersecting) {
		intersected.value = true;
		this.disconnect();
	}

	if (loaded.value) {
		this.disconnect();
	}
}
</script>

<template>
	<Match :maybe="source">
		<template #some="{ data: source }">
			<div class="image" v-intersection="intersect_handler">
				<figure class="[ m=0 align-t:center ]">
					<img
						ref="$image"
						v-bind="$attrs"
						:src="source"
						:alt="alt"
						:width="size_attribute"
						:height="size_attribute"
						:class="[
							{ [`size=${size}`]: size },
							{ 'img:cover': cover },
							{
								'border/radius=50': rounded,
								'border/radius=1': !rounded,
							},
							'box:shadow select:none',
						]"
						draggable="false"
						loading="lazy"
						@load="load_image_handler"
						@error="error_fallback_handler"
					/>

					<figcaption class="[ align-t:center ]">
						<slot />
					</figcaption>
				</figure>
			</div>
		</template>
	</Match>
</template>

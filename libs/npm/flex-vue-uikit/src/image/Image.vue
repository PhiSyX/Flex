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
import {
	computed,
	onMounted as on_mounted,
	onUnmounted as on_unmounted,
	ref
} from "vue";

import { Some } from "@phisyx/flex-safety";
import { vIntersection } from "@phisyx/flex-vue-directives";

import Match from "../match/Match.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	alt?: HTMLImageElement["alt"];
	/**
	 * Source de l'image. En cas d'échec de chargement, la propriété `fallback` 
	 * est utilisé pour charger une par défaut.
	 */
	src: HTMLImageElement["src"];
	/**
	 * Image à charger en cas d'échec.
	 * 
	 * @default "/public/img/default-avatar.png"
	 */
	 fallback?: string;
	/**
	 * Taille de l'image en nombre premier. Cette taille est calculée par un
	 * multiple de 8.
	 *
	 * @example size=4
	 * @output `props.size * 8 //?= 32`
	 */
	size?: string | number;
	/**
	 * Applique une bordure à l'image de 50%.
	 */
	rounded?: boolean;
	/**
	 * Applique le style `object-fit: cover;`.
	 */
	cover?: boolean;
	/**
	 * Rafraîchi la source de l'image toutes les `refreshTime` minutes.
	 * 
	 * @default true
	 * 
	 * @default refreshTime.PROD=30
	 * @default refreshTime.DEV=1
	 */
	refreshSrc?: boolean;
	/**
	 * Quand est-ce le rafraîchissement doit être fait. En **MINUTE**.
	 * 
	 * @default PROD=30
	 * @default DEV=1
	 */
	refreshTime?: number;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	cover: true,
	fallback: IMAGE_FALLBACK,
	refreshSrc: true,
	refreshTime: IMAGE_CACHE_MINUTE,
});

let size = computed(
	() => Number.parseInt(props.size?.toString() || IMAGE_SIZE_FALLBACK, 10)
);
let size_attribute = computed(() => size.value * 8);

let intersected = ref(false);
let refresh_timer = ref();

let $image = ref<HTMLDivElement>();

let _source = ref(get_img_src());
let source = computed({
	get() {
		return _source.value;
	},
	set($1) {
		_source.value = $1;
	}
});

on_mounted(() => {
	refresh_timer.value = setTimeout(() => {
		source.value = get_img_src();
	}, 8 << 5);

	if (props.refreshSrc) {
		refresh_timer.value = setInterval(() => {
			source.value = get_img_src();
		}, props.refreshTime * 60_000);
	}
});

on_unmounted(() => {
	if (props.refreshSrc) {
		clearInterval(refresh_timer.value);
	}
});

// ------- //
// Handler //
// ------ //

function load_image_handler(_: Event)
{
	let loaded = $image.value?.getAttribute("src") !== props.fallback;

	let img = IMAGE_CACHE.get(props.src);
	if (img) {
		img.loaded = loaded;
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
	}
}

function get_img_src()
{
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
		expires.setMinutes(current_minute + props.refreshTime);
		
		IMAGE_CACHE.set(props.src, {
			expires,
			loaded: false,
			source: img_src,
		});
	}
	
	return Some(img_src + "?r=" + refresh_timer.value);
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

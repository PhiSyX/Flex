<script setup lang="ts">
import type { ImageChildren } from "@phisyx/flex-uikit/image/children";
import type { ImageProps } from "@phisyx/flex-uikit/image/props";

import {
	IMAGE_CACHE_MINUTE,
	IMAGE_FALLBACK,
} from "@phisyx/flex-uikit/image/cache";
import { error_fallback, load_image } from "@phisyx/flex-uikit/image/handler";
import { get_img_src, parse_image_size } from "@phisyx/flex-uikit/image/view";
import { vIntersection } from "@phisyx/flex-vue-directives";
import {
	computed,
	onMounted,
	onUnmounted,
	ref,
	shallowRef,
	useTemplateRef,
	watch,
} from "vue";

// --------- //
// Composant //
// --------- //

const {
	cover = true,
	fallback = IMAGE_FALLBACK,
	file,
	refreshSrc = true,
	refreshTime = IMAGE_CACHE_MINUTE,
	size,
	src,
} = defineProps<ImageProps>();

defineSlots<ImageChildren>();

let refresh_timeout = shallowRef<number>(0);

let intersected = ref(false);
let $image = useTemplateRef("$image");
let _source = ref(
	get_img_src(src, fallback, {
		intersected: intersected.value,
		refresh_source: refreshSrc,
		refresh_time: refreshTime,
		refresh_timeout: refresh_timeout.value,
	})
);

let sized = computed(() => parse_image_size(size));
let size_attribute = computed(() => sized.value * 8);
let source = computed({
	get() {
		return _source.value;
	},
	set($1) {
		_source.value = $1;
	},
});

onMounted(() => {
	refresh_timeout.value = setTimeout(() => {
		source.value = get_img_src(src, fallback, {
			intersected: intersected.value,
			refresh_source: refreshSrc,
			refresh_time: refreshTime,
			refresh_timeout: refresh_timeout.value,
		});
	}, 1 << 8);

	if (refreshSrc) {
		refresh_timeout.value = setInterval(() => {
			source.value = get_img_src(src, fallback, {
				intersected: intersected.value,
				refresh_source: refreshSrc,
				refresh_time: refreshTime,
				refresh_timeout: refresh_timeout.value,
			});
		}, refreshTime * 60_000);
	}
});

onUnmounted(() => {
	if (refreshSrc) {
		clearInterval(refresh_timeout.value);
	}
});

watch(
	() => file,
	(file) => {
		let url = URL.createObjectURL(file as File);
		source.value = url;
	}
);

// ------- //
// Handler //
// ------ //

const load_image_handler = (_: Event) =>
	load_image(src, fallback, $image.value);

function error_fallback_handler(_: Event) {
	intersected.value = false;
	error_fallback(src, fallback);
}

function intersect_handler(
	this: IntersectionObserver,
	entries: Array<IntersectionObserverEntry>
) {
	let [image] = entries;
	if (image.isIntersecting) {
		intersected.value = true;
	}
}
</script>

<template>
	<div
		v-intersection="intersect_handler"
		class="fx:image"
		:class="[rootClass, { 'fx:image/vertical': !textInline }]"
	>
		<figure
			class="[ m=0 gap=1 ]"
			:class="{ 'i-flex align-i:center': textInline }"
		>
			<img
				ref="$image"
				v-bind="$attrs"
				:src="source"
				:alt="alt"
				:width="size_attribute"
				:height="size_attribute"
				:class="[
					{ [`size=${sized}`]: sized },
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

			<figcaption>
				<slot />
			</figcaption>
		</figure>
	</div>
</template>

<style lang="scss" scoped>
@import "@phisyx/flex-uikit-stylesheets/image/Image.scss";
</style>

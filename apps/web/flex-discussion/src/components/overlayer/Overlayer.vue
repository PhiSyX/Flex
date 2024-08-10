<script setup lang="ts">
import type { CSSProperties, HTMLAttributes } from "vue";

import { shallowRef as shallow_ref, watchEffect as watch_effect } from "vue";

import { vTrap } from "~/directives";
import { use_overlayer_store } from "~/store";

import { use_overlayer } from "./Overlayer.hooks";

// --------- //
// Composant //
// --------- //

let overlayer_store = use_overlayer_store();

let $overlayer = shallow_ref<HTMLDivElement>();
let $teleport = shallow_ref<Array<HTMLDivElement>>();

const { destroy_handler } = use_overlayer();

watch_effect(() => {
	if ($overlayer.value) {
		overlayer_store.store.$overlayer = $overlayer.value;
	}

	if ($teleport.value && $teleport.value.length > 0) {
		// biome-ignore lint/style/noNonNullAssertion: ;-)
		overlayer_store.store.$teleport = $teleport.value.pop()!.firstElementChild as HTMLDivElement;
		overlayer_store.update_all();
	}
});
</script>

<template>
	<Transition name="fade">
		<div v-if="overlayer_store.has_layers" id="overlayer">
			<div ref="$overlayer" class="overlay [ pos-a:full ]" @click="destroy_handler" />

			<template v-for="[id, layer] of overlayer_store.layers" :key="`${id}_layer`">
				<div v-trap:focus="layer.trap_focus">
					<div
						:id="`${id}_layer`"
						class="layer [ border/radius=1 ]"
						@keydown.esc="destroy_handler($event, id)"
						:style="(layer.style as CSSProperties)"
					/>

					<div
						ref="$teleport"
						:id="`${id}_teleport`"
						tabindex="0"
						class="teleport [ pos-a:full flex! ]"
						:class="{
							'flex/center:full': layer.centered,
						}"
						:style="(layer.mouse_position as HTMLAttributes['style'])"
					/>
				</div>
			</template>
		</div>
	</Transition>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

.overlay {
	position: fixed;
	z-index: 1000;

	background-color: hsla(var(--overlayer-bg), 0.75);

	@include fx.scheme using ($name) {
		@if $name == ice {
			--overlayer-bg: var(--color-black_hsl);
		} @else if $name == light {
			--overlayer-bg: var(--color-grey700_hsl);
		} @else if $name == dark {
			--overlayer-bg: var(--color-black_hsl);
		}
	}
}

.layer {
	position: fixed;

	/*
	top: var(--top);
	right: var(--right);
	bottom: var(--bottom);
	left: var(--left);

	width: var(--width);
	height: var(--height);
	*/

	background: hsla(var(--overlayer-bg), 50%);
	border: 1px solid var(--layer-border);
	box-shadow: 0 2px 16px var(--layer-box-shadow);

	z-index: 1005;

	@include fx.scheme using ($name) {
		@if $name == ice {
			--overlayer-bg: var(--color-black_hsl);
			--layer-border: var(--color-blue300);
			--layer-box-shadow: hsla(var(--color-white_hsl), 50%);
		} @else if $name == dark {
			--overlayer-bg: var(--color-black_hsl);
			--layer-border: var(--color-blue300);
			--layer-box-shadow: hsla(var(--color-white_hsl), 50%);
		} @else if $name == light {
			--overlayer-bg: var(--color-white_hsl);
			--layer-border: var(--color-indigo300);
			--layer-box-shadow: hsla(var(--color-black_hsl), 30%);
		}
	}
}

.layer\@highlight {
	z-index: 1010 !important;

	position: relative;
}
.layer\@highlight--alt {
	z-index: 1010 !important;
}

.layer\@highlight:not(input),
.layer\@highlight--alt:not(input) {
	pointer-events: none;
}

.teleport {
	outline: 0;
}
.teleport > * {
	z-index: 1011;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 200ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>

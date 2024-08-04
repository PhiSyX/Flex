<script setup lang="ts">
import type { CSSProperties } from "vue";

import { vTrap } from "~/directives";
import { use_overlayer } from "./Overlayer.hooks";

const { store, destroy_handler } = use_overlayer();
</script>

<template>
	<Transition name="fade">
		<div v-if="store.has_layers" id="overlayer">
			<div class="overlay [ pos-a:full ]" @click="destroy_handler" />

			<template v-for="[id, layer] of store.layers" :key="`${id}_layer`">
				<div v-trap:focus="layer.trap_focus">
					<div
						:id="`${id}_layer`"
						class="layer [ border/radius=1 ]"
						@keydown.esc="destroy_handler($event, id)"
						:style="(layer.style) as CSSProperties"
					/>

					<div
						:id="`${id}_teleport`"
						tabindex="0"
						class="teleport [ pos-a:full flex! ]"
						:class="{
							'flex/center:full': layer.centered,
						}"
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

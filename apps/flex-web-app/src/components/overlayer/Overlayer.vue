<script setup lang="ts">
import { useOverlayer } from "./Overlayer.hooks";
import OverlayerTeleport from "./Teleport.vue";

const { store, destroyHandler } = useOverlayer();
</script>

<template>
	<Transition name="fade">
		<div v-if="store.hasLayers" id="overlayer" v-trap:focus="{}">
			<div class="overlay [ pos-a:full ]" @click="destroyHandler" />

			<div
				class="layer [ border/radius=1 ]"
				v-for="[id, layer] of store.layers"
				@keydown.esc="destroyHandler($event, id)"
				:key="`${id}_layer`"
				:id="`${id}_layer`"
				:style="layer.style"
			/>

			<OverlayerTeleport
				v-for="[id, layer] of store.layers"
				:key="`${id}_teleport`"
				:id="id"
				:layer="layer"
			/>
		</div>
	</Transition>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

.overlay {
	position: fixed;
	z-index: 1000;

	background-color: hsla(var(--overlayer-bg), 0.75);

	@include fx.theme using ($name) {
		@if $name == ice {
			--overlayer-bg: var(--color-black_hsl);
		} @else if $name == light {
			--overlayer-bg: var(--color-grey700_hsl);
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

	@include fx.theme using ($name) {
		@if $name == ice {
			--overlayer-bg: var(--color-grey500_hsl);
			--layer-border: var(--color-yellow700);
			--layer-box-shadow: hsla(var(--color-white_hsl), 50%);
		} @else if $name == light {
			--overlayer-bg: var(--color-white_hsl);
			--layer-border: var(--color-indigo300);
			--layer-box-shadow: hsla(var(--color-black_hsl), 30%);
		}
	}

	z-index: 1005;
	&\@highlight {
		z-index: 1010 !important;

		position: relative;

		pointer-events: none;
	}
	&\@highlight--alt {
		z-index: 1010 !important;

		pointer-events: none;
	}
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

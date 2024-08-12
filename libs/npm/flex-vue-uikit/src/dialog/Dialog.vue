<script setup lang="ts">
import UiButton from "../button/Button.vue";

// ---- //
// Type //
// ---- //

interface Props 
{
	open?: boolean;
	withoutClose?: boolean;
	withoutHeader?: boolean;
}

interface Emits 
{
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(event_name: "close", evt: MouseEvent): void;
}

// --------- //
// Composant //
// --------- //

withDefaults(defineProps<Props>(), {
	open: true,
	withoutClose: false,
	withoutHeader: false,
});
const emit = defineEmits<Emits>();
</script>

<template>
	<dialog :open="open" class="dialog [ border/radius=1 flex! gap=1 ]">
		<header v-if="!withoutHeader" class="[ flex gap=1 ]">
			<h1 class="dialog/title [ flex:full p=1 m=0 ]">
				<slot name="label" />
			</h1>

			<div class="dialog/actions [ flex:shrink=0 ]">
				<slot name="actions" />

				<UiButton
					v-if="!withoutClose"
					icon="close"
					class="[ h:full ]"
					@click="emit('close', $event)"
				/>
			</div>
		</header>

		<div class="dialog/body [ flex:full p=1 ov:a ]">
			<slot />
		</div>

		<footer class="[ align-t:right p=1 ]">
			<slot name="footer" />
		</footer>
	</dialog>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

dialog {
	width: 100%;
	height: 100%;

	@media (min-width: 530px) and (min-height: 530px) {
		width: max-content;
		height: max-content;
		max-height: fx.space(500);
		max-width: fx.space(400);
	}
}

dialog {
	box-shadow: var(--box-shadow);

	background: var(--dialog-bg, canvas);
	color: var(--dialog-color, var(--default-text-color_alt));
	border-color: var(--dialog-border-color);

	font-size: 13px;
	user-select: none;
}

@include fx.class("dialog/title") {
	font-size: 20px;
	font-weight: 500;
	font-family: Arial, Helvetica, sans-serif;
}
</style>

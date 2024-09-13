<script setup lang="ts">
import UiButton from "../button/Button.vue";

// ---- //
// Type //
// ---- //

interface Props {
	open?: boolean;
	closeLabeled?: boolean;
	withoutClose?: boolean;
	withoutHeader?: boolean;
}

interface Emits {
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(event_name: "close", evt: MouseEvent): void;
}

interface Slots {
	default: unknown;
	"left-content": unknown;
	label: unknown;
	actions: unknown;
	footer: unknown;
	"right-content": unknown;
}

// --------- //
// Composant //
// --------- //

withDefaults(defineProps<Props>(), {
	open: true,
	closeLabeled: true,
	withoutClose: false,
	withoutHeader: false,
});
const emit = defineEmits<Emits>();
defineSlots<Slots>();
</script>

<template>
	<dialog
		:open="open"
		class="dialog [ border/radius=1 flex size:full f-size=13px select:none ]"
	>
		<slot name="left-content" />

		<div class="flex! gap=1">
			<header
				v-if="!withoutHeader"
				class="[ flex flex/center:full gap=1 ]"
			>
				<h1
					class="dialog/title [ flex:full p=1 m=0 f-size=20px f-family=arial ]"
				>
					<slot name="label" />
				</h1>

				<div class="dialog/actions [ flex:shrink=0 ]">
					<slot name="actions" />

					<UiButton
						v-if="!withoutClose && closeLabeled"
						class="dialog/close:label [ f-size=10px ]"
						title="Fermer la boite modale"
						@click="emit('close', $event)"
					>
						ESC
					</UiButton>
					<UiButton
						v-else-if="!withoutClose"
						icon="close"
						class="dialog/close"
						title="Fermer la boite modale"
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
		</div>

		<slot name="right-content" />
	</dialog>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

dialog {
	box-shadow: var(--box-shadow);
	background: var(--dialog-bg, canvas);
	color: var(--dialog-color, var(--default-text-color_alt));
	border-color: var(--dialog-border-color);

	@media (min-width: 530px) and (min-height: 530px) {
		width: max-content;
		height: max-content;
		max-height: fx.space(500);
		max-width: fx.space(400);
	}
}

@include fx.class("dialog/close:label") {
	padding: 2px;
	border: 1px solid;
	border-radius: 3px;
}

@include fx.class("dialog/title") {
	font-weight: 500;
}
</style>

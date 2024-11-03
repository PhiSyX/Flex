<script setup lang="ts">
import type { DialogChildren } from "@phisyx/flex-uikit/dialog/children";
import type { DialogEmits } from "@phisyx/flex-uikit/dialog/emits";
import type { DialogProps } from "@phisyx/flex-uikit/dialog/props";

import Button from "../button/Button.vue";

// --------- //
// Composant //
// --------- //

const {
	open = true,
	closeLabeled = true,
	withoutClose = false,
	withoutHeader = false,
} = defineProps<DialogProps>();

const emit = defineEmits<DialogEmits>();
defineSlots<DialogChildren>();
</script>

<template>
	<dialog
		:open="open"
		class="fx:dialog [ border/radius=1 flex size:full f-size=13px select:none p=1 ]"
	>
		<slot name="left-content" />

		<div class="[ flex! gap=1 ]">
			<header
				v-if="!withoutHeader"
				class="[ flex flex/center:full gap=1 ]"
			>
				<h1
					class="fx:dialog/title [ flex:full p=1 m=0 f-size=20px f-family=arial ]"
				>
					<slot name="label" />
				</h1>

				<div class="fx:dialog/actions [ flex:shrink=0 ]">
					<slot name="actions" />

					<Button
						v-if="!withoutClose && closeLabeled"
						class="fx:dialog/close/label [ f-size=10px ]"
						title="Fermer la boite modale"
						@click="emit('close', $event)"
					>
						ESC
					</Button>
					<Button
						v-else-if="!withoutClose"
						icon="close"
						class="fx:dialog/close"
						title="Fermer la boite modale"
						@click="emit('close', $event)"
					/>
				</div>
			</header>

			<div class="fx:dialog/body [ flex:full p=1 ov:a ]">
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
@use "@phisyx/flex-uikit-stylesheets/dialog/Dialog.scss";
</style>

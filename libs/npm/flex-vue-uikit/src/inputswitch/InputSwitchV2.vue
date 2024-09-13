<script setup lang="ts">
import { computed, watchEffect as watch_effect } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	name: string;
	disabled?: boolean;
	position?: "left" | "right";
}

interface Emits {
	(event_name: "on"): void;
	(event_name: "off"): void;
}

interface Slots {
	default: unknown;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), { position: "left" });
const emit = defineEmits<Emits>();
defineSlots<Slots>();

let input_model = defineModel();

let title_attribute = computed(() => {
	let state = input_model.value ? "Activé" : "Désactivé";
	if (props.disabled) {
		return `${state} (verrouillé)`;
	}
	return state;
});

// --------- //
// Lifecycle //
// --------- //

watch_effect(() => {
	if (input_model.value) {
		emit("on");
	} else {
		emit("off");
	}
});
</script>

<template>
	<label
		:for="name"
		class="input@radio/switch [ pos-r i-flex align-i:center align-v:middle gap=2 ]"
		:class="{
			'cursor:default': disabled,
		}"
		:title="title_attribute"
	>
		<input
			:id="name"
			v-model="input_model"
			:name="name"
			role="switch"
			type="checkbox"
			class="[ size=0 vis:h ]"
			style="position: absolute;"
			:disabled="disabled"
		/>

		<span
			class="input@radio/switch:control [ pos-r i-flex flex/center:full w=5 h=2 border/radius=1 ]"
			:style="{
				order: position === 'right' ? 1 : undefined,
			}"
		>
			<span
				class="input@radio/switch:thumb [ size=3 border/radius=50 ]"
			></span>
		</span>

		<p class="input@radio/switch:label [ p:reset ]">
			<slot />
		</p>
	</label>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("input@radio/switch:control") {
	input[type="checkbox"] ~ & {
		border: 1px solid var(--color-grey200);
		background: linear-gradient(
			90deg,
			var(--color-grey300) 0%,
			var(--color-grey400) 100%
		);
		transition: 200ms background-color, 200ms border-color, 200ms box-shadow;
	}

	input[type="checkbox"]:not(:disabled) ~ & {
		box-shadow: 2px 2px 4px var(--color-blue-grey700);
	}

	input[type="checkbox"]:disabled ~ & {
		opacity: 0.5;
	}

	input[type="checkbox"]:checked ~ & {
		@include fx.scheme using ($name) {
			@if $name == light {
				border-color: #d8af20;
				background: linear-gradient(90deg, #b69a36 0%, #d8af20 100%);
			} @else if $name == ice {
				border-color: var(--color-blue-grey200);
				background: linear-gradient(
					90deg,
					var(--color-blue-grey400) 0%,
					var(--color-blue-grey200) 100%
				);
			} @else if $name == dark {
				border-color: #d8af20;
				background: linear-gradient(90deg, #b69a36 0%, #d8af20 100%);
			}
		}
	}

	input[type="checkbox"]:checked:not(:disabled) ~ & {
		@include fx.scheme using ($name) {
			@if $name == light {
				box-shadow: -2px 2px 4px var(--color-ultra-black);
			} @else if $name == ice {
				box-shadow: -2px 2px 4px var(--color-blue-grey700);
			} @else if $name == dark {
				box-shadow: -2px 2px 4px var(--color-ultra-black);
			}
		}
	}
}

@include fx.class("input@radio/switch:thumb") {
	border: 1px solid var(--color-grey200);
	background: var(--color-grey300);

	translate: calc(#{fx.space(1)} - #{fx.space(3)});
	transition: 200ms translate ease, 200ms background-color, 200ms border-color,
		200ms box-shadow;

	@include fx.scheme using ($name) {
		@if $name == light {
			box-shadow: 0px 2px 4px var(--color-blue-grey700);
		} @else if $name == ice {
			box-shadow: 0px 2px 4px var(--color-blue-grey700);
		} @else if $name == dark {
			box-shadow: 0px 2px 4px var(--color-blue-grey700);
		}
	}

	input[type="checkbox"]:checked ~ * & {
		translate: #{fx.space(2)};
		@include fx.scheme using ($name) {
			@if $name == light {
				box-shadow: 2px 2px 4px var(--color-ultra-black);
			} @else if $name == ice {
				box-shadow: 2px 2px 4px var(--color-blue-grey700);
			} @else if $name == dark {
				box-shadow: 2px 2px 4px var(--color-ultra-black);
			}
		}
	}
}

p {
	user-select: none;
}
</style>

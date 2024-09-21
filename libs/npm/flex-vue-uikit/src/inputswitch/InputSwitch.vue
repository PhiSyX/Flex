<script setup lang="ts">
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	form?: string;
	labelN?: string;
	valueN?: string | boolean;
	labelY?: string;
	valueY?: string | boolean;
	modelValue: boolean;
	name: string;
}

interface Slots {
	default: unknown;
}

// -------- //
// Constant //
// -------- //

enum InputRadioLabelDefault {
	Yes = "Yes",
	No = "No",
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	valueY: true,
	valueN: false,
});
defineSlots<Slots>();

let inputModel = defineModel();
let uniqueID = computed(() => props.name);
let inputAttrID = `radio_${uniqueID.value}`;
let inputAttrIDYes = `${inputAttrID}_y`;
let inputAttrIDNo = `${inputAttrID}_n`;
</script>

<template>
	<div class="input@radio/switch">
		<slot />

		<ol class="[ pos-r i-flex ]">
			<li class="[ pos-r display-ib ]">
				<input
					:id="inputAttrIDYes"
					v-model="inputModel"
					:form="form"
					:name="name"
					:value="valueY"
					type="radio"
				/>

				<label
					:for="inputAttrIDYes"
					class="[ pos-r display-b f-size=14px align-t:center cursor:pointer select:none ]"
				>
					{{ labelY || InputRadioLabelDefault.Yes }}
				</label>
			</li>

			<li class="[ pos-r display-ib ]">
				<input
					:id="inputAttrIDNo"
					v-model="inputModel"
					:form="form"
					:name="name"
					:value="valueN"
					type="radio"
				/>

				<label
					:for="inputAttrIDNo"
					class="[ pos-r display-b f-size=14px align-t:center cursor:pointer select:none ]"
				>
					{{ labelN || InputRadioLabelDefault.No }}
				</label>

				<div aria-hidden="true" class="marker"></div>
			</li>
		</ol>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

ol {
	--w: #{fx.space(160)};
	--h: #{fx.space(40)};
	--p: calc(#{fx.space(1)} / 2);
	--r: 50em;

	padding: var(--p);
	border-radius: var(--r);
	border: 2px solid var(--bc);

	@include fx.scheme using ($name) {
		@if $name == light {
			--bc: var(--color-black);
			--bg: var(--color-black);
		} @else if $name == ice {
			--bc: var(--color-grey50);
			--bg: var(--color-black);
		} @else if $name == dark {
			--bc: var(--color-grey50);
			--bg: var(--color-black);
		}
	}

	&:focus-within,
	&:active {
		box-shadow: 0 0 0 3px var(--bc);
	}
}

li {
	height: calc(var(--h) - 2 * var(--p));
	width: calc(var(--w) * 0.5 - var(--p));
}

label[for] {
	z-index: 2;
	transition: all 0.3s;
	border-radius: var(--r);
	line-height: calc(var(--h) - 2 * var(--p));
}

input {
	overflow: hidden;

	position: absolute !important;

	width: 1px;
	height: 1px;

	margin: -1px;
	padding: 0;

	border: 0;

	clip: rect(0, 0, 0, 0);
}

input:checked ~ label[for] {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	@include fx.scheme using ($name) {
		@if $name == light {
			color: var(--color-white);
		} @else if $name == ice {
			color: var(--color-white);
		} @else if $name == dark {
			color: var(--color-white);
		}
	}
}

:not(*):focus-within,
input:focus ~ label[for] {
	background-color: transparent;
}

.marker {
	z-index: 1;

	position: absolute;
	top: 0;
	left: -100%;

	height: calc(var(--h) - 2 * var(--p));
	width: calc(var(--w) * 0.5 - var(--p));

	transition: transform 0.3s;

	border-radius: var(--r);
	background-color: var(--bg);

	input:checked ~ & {
		transform: translateX(100%);
	}
}
</style>

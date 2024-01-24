<script setup lang="ts">
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	form?: string;
	labelN?: string;
	labelY?: string;
	modelValue: boolean;
	name: string;
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

const props = defineProps<Props>();

const inputModel = defineModel();
const uniqueID = computed(() => props.name);
const inputAttrID = `radio_${uniqueID.value}`;
const inputAttrIDYes = `${inputAttrID}_y`;
const inputAttrIDNo = `${inputAttrID}_n`;
</script>

<template>
	<div class="input@radio/switch">
		<slot />

		<ol>
			<li>
				<input
					:id="inputAttrIDYes"
					v-model="inputModel"
					:form="form"
					:name="name"
					:value="true"
					type="radio"
				/>

				<label :for="inputAttrIDYes">
					{{ labelY || InputRadioLabelDefault.Yes }}
				</label>
			</li>

			<li>
				<input
					:id="inputAttrIDNo"
					v-model="inputModel"
					:form="form"
					:name="name"
					:value="false"
					type="radio"
				/>

				<label :for="inputAttrIDNo">
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

	position: relative;
	display: inline-flex;

	padding: var(--p);
	border-radius: var(--r);
	border: 2px solid var(--bc);

	@include fx.theme using ($name) {
		@if $name == light {
			--bc: var(--color-black);
			--bg: var(--color-black);
		} @else if $name == ice {
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
	position: relative;
	display: inline-block;
	height: calc(var(--h) - 2 * var(--p));
	width: calc(var(--w) * 0.5 - var(--p));
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

label[for] {
	z-index: 2;

	position: relative;
	display: block;

	transition: all 0.3s;

	text-align: center;
	border-radius: var(--r);

	font-size: 14px;
	line-height: calc(var(--h) - 2 * var(--p));

	cursor: pointer;
	user-select: none;
}

input:checked ~ label[for] {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	@include fx.theme using ($name) {
		@if $name == light {
			color: var(--color-white);
		} @else if $name == ice {
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

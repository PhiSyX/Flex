<script setup lang="ts">
import type { ComboBoxProps } from "@phisyx/flex-uikit/combobox/props";
import type { DropDownListItem } from "@phisyx/flex-uikit/dropdown/props";

import { minmax } from "@phisyx/flex-helpers";
import { filter_list } from "@phisyx/flex-uikit/combobox/handler";
import { computed, ref, useTemplateRef, watch } from "vue";

import Button from "../button/Button.vue";
import DropDownList from "../dropdown/DropDownList.vue";

// --------- //
// Composant //
// --------- //

const {
	list,
	name,
	openOnInput = true,
	prependEmpty = false,
	sync = false,
} = defineProps<ComboBoxProps>();

let outmodel = defineModel<string>({ required: true });

let $input = useTemplateRef("$input");
let inmodel = ref(outmodel.value);
let opened = ref(false);
let position_index = ref(-1);

let filtered_list = ref<Array<DropDownListItem>>([]);
let id_list = computed(() => `${name}_list`);

watch(
	inmodel,
	() => {
		filtered_list.value = filter_list(
			{
				in: inmodel.value,
				out: outmodel.value,
			},
			prependEmpty ? [{ value: "", label: "" }, ...list] : list,
		);

		if (sync) {
			outmodel.value = inmodel.value;
		}
	},
	{ immediate: true },
);

function toggle_list() {
	opened.value = !opened.value;
}

function on_select_handler(
	selected_item: ComboBoxProps["list"][number] & { position: number },
) {
	position_index.value = selected_item.position;

	outmodel.value = selected_item.value;
	inmodel.value = selected_item.value;

	opened.value = false;
}

function input_handler() {
	if (openOnInput) {
		opened.value = true;
	}
}

function escape_handler(evt: Event) {
	if (!opened.value) {
		return;
	}
	evt.stopPropagation();
	opened.value = false;
}

function enter_handler(evt: Event) {
	if (!opened.value) {
		position_index.value = -1;
		outmodel.value = inmodel.value;
		opened.value = false;

		return;
	}

	evt.preventDefault();
	let selected_item = filtered_list.value[position_index.value];
	if (selected_item) {
		on_select_handler(selected_item);
	} else {
		opened.value = false;
	}
}

function decrement_list() {
	if (!opened.value) {
		return;
	}

	position_index.value = minmax(
		position_index.value - 1,
		-1,
		filtered_list.value.length,
	);

	if (position_index.value === -1) {
		position_index.value = filtered_list.value.length - 1;
	}
}

function increment_list() {
	if (!opened.value) {
		return;
	}

	position_index.value = minmax(
		position_index.value + 1,
		-1,
		filtered_list.value.length,
	);

	if (position_index.value === filtered_list.value.length) {
		position_index.value = 0;
	}
}

function to_start_list() {
	if (!opened.value) {
		return;
	}

	position_index.value = 0;
}

function to_end_list() {
	if (!opened.value) {
		return;
	}

	position_index.value = filtered_list.value.length - 1;
}
</script>

<template>
	<div class="fx:combobox [ pos-r ]" :open="opened">
		<div class="[ flex ]">
			<input
				ref="$input"
				v-model="inmodel"
				:id="name"
				:list="id_list"
				:name="name"
				type="text"
				class="[ flex:full ]"
				:placeholder="placeholder"
				@input="input_handler"
				@keydown.esc="escape_handler"
				@keydown.enter="enter_handler"
				@keydown.end="to_end_list"
				@keydown.down="increment_list"
				@keydown.home="to_start_list"
				@keydown.up="decrement_list"
				@keydown.ctrl.space="toggle_list"
			/>
			<Button
				class="fx:combobox/activator"
				icon="arrow-down"
				type="button"
				v-model:selected="opened"
				:true-value="true"
				:false-value="false"
				@update:selected="$input?.focus()"
			/>
		</div>

		<DropDownList
			v-show="opened"
			v-model:position="position_index"
			:id="id_list"
			:list="filtered_list"
			class="fx:combobox/dropdown"
			@select="on_select_handler"
		/>
	</div>
</template>

<style lang="scss" scoped>
@import "@phisyx/flex-uikit-stylesheets/combobox/ComboBox.scss";
</style>

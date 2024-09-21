<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";

import { minmax } from "@phisyx/flex-helpers";

import UiButton from "../button/Button.vue";
import DropDownList from "../dropdown/DropDownList.vue";

// ---- //
// Type //
// ---- //

interface Props {
	name: string;
	list: Array<{ label: string; value: string }>;
	openOnInput?: boolean;
	placeholder?: string;
	prependEmpty?: boolean;
	sync?: boolean;
}

// --------- //
// Composant //
// --------- //

const {
	list,
	name,
	openOnInput = true,
	prependEmpty = false,
	sync = false,
} = defineProps<Props>();

let outmodel = defineModel<string>({ required: true });

let $input = useTemplateRef("$input");
let inmodel = ref(outmodel.value);
let opened = ref(false);
let position_index = ref(-1);

let filtered_list = ref<
	Array<{
		label: string;
		value: string;
		position: number;
		selected: boolean;
	}>
>([]);
let id_list = computed(() => `${name}_list`);

watch(
	inmodel,
	(ininput) => {
		let outinput = outmodel.value;
		let ininput_l = ininput.toLowerCase();
		let plist = list;

		if (prependEmpty) {
			plist = [
				{
					value: "",
					label: "",
				},
				...list,
			];
		}

		if (ininput_l.length === 0) {
			filtered_list.value = plist.map((item, idx) => ({
				...item,
				selected: outinput === item.value || outinput === item.label,
				position: idx,
			}));

			if (sync) {
				outmodel.value = ininput;
			}
			return;
		}

		filtered_list.value = plist
			.map((item, idx) => ({
				...item,
				selected: outinput === item.value || outinput === item.label,
				position: idx,
			}))
			.filter((item) => {
				return (
					item.value.toLowerCase().startsWith(ininput_l) ||
					item.label.toLowerCase().startsWith(ininput_l)
				);
			});

		if (sync) {
			outmodel.value = ininput;
		}
	},
	{ immediate: true }
);

function toggle_list() {
	opened.value = !opened.value;
}

function on_select_handler(
	selected_item: Props["list"][number] & { position: number }
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
		filtered_list.value.length
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
		filtered_list.value.length
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
	<div class="combobox [ pos-r ]" :open="opened">
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
			<UiButton
				class="combobox/activator"
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
			class="combobox/dropdown"
			@select="on_select_handler"
		/>
	</div>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

.combobox[open="true"] {
	box-shadow: 2px 3px 4px var(--color-grey700);
}

.combobox[open="true"] .combobox\/activator {
	border-bottom-color: transparent;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}

.combobox[open="true"] input {
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}

@include fx.class("combobox/dropdown") {
	position: fixed;
	border-top-left-radius: 0;
	border-top-right-radius: 0;
	border-top: 0;
	box-shadow: 2px 3px 4px var(--color-grey700);
	width: 210px;
}

input {
	width: fx.space(180);
	padding: 3px;

	border: 1px inset ButtonBorder;
	border-right-color: transparent;
	border-radius: 4px;
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}

@include fx.class("combobox/activator") {
	border: 1px inset ButtonBorder;

	border-top-right-radius: 4px;
	border-bottom-right-radius: 4px;
}
</style>

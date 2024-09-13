// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Props } from "./RoomEditbox.state";

import { computed, ref, watch } from "vue";

import { $input, input_model } from "./RoomEditbox.state";

// ----- //
// Hooks //
// ----- //

export function use_autocompletion(props: Props) {
	let position_suggestion = ref(-1);
	let position_word = ref(0);
	let suggestions = ref([] as Array<string>);
	let suggestion_input = ref("");

	function apply_suggestion_handler() {
		input_model.value = suggestion_input.value;
		suggestion_input.value = "";
		$input.value?.focus();
	}

	function input_handler(evt: Event) {
		let el = evt.target as HTMLInputElement;
		let word = get_word_by_position_cursor(el);

		if (word.length === 0) {
			input_completer();
			return;
		}

		suggestions.value = word_completer(props.completionList || [], word);

		if (
			word.length >= 1 &&
			input_model.value.slice(-1) !== " " &&
			suggestions.value.length > 0
		) {
			input_completer(suggestions.value[0]);
		} else {
			input_completer();
		}
	}

	function keydown_handler(evt: KeyboardEvent) {
		if (input_model.value.length === 0) {
			return;
		}

		if (["ArrowDown", "ArrowUp"].includes(evt.key)) {
			suggestion_input.value = "";
			return;
		}

		if (evt.key !== "Tab") {
			position_suggestion.value = -1;
			return;
		}

		let last_space_char = input_model.value.slice(-1) === " ";

		if (last_space_char) {
			return;
		}

		if (evt.shiftKey) {
			position_suggestion.value--;
		} else {
			position_suggestion.value++;
		}

		let ls = suggestions.value.length;

		if (position_suggestion.value <= -1) {
			position_suggestion.value = ls - 1;
		}

		if (position_suggestion.value >= ls) {
			position_suggestion.value = 0;
		}

		if (suggestions.value.length > 0) {
			evt.preventDefault();
		}

		let ps = position_suggestion.value;
		let ds = ps % ls;
		let found = suggestions.value[ds];

		if (!found) {
			return;
		}

		input_completer(found, evt.shiftKey ? "ShiftTab" : "Tab");
	}

	function get_word_by_position_cursor(el: HTMLInputElement) {
		let cursor = el.selectionStart || 0;
		let words = input_model.value.split(/\s/);

		let word = "";

		for (let idx = 0, count = 0; idx < words.length; idx++) {
			let temp = words[idx];

			count += temp.length + 1;

			if (count >= cursor) {
				position_word.value = idx;
				word = temp;
			}
		}

		return word;
	}

	function input_completer(suggest = "", type = "input") {
		let words = input_model.value.split(/\s/);
		let parts = input_model.value.split(/\s/);
		let word = parts[position_word.value] || "";

		words[position_word.value] = word + suggest.slice(word.length);
		if (suggestions.value.length > 0) {
			suggestion_input.value = words.join(" ");
		}

		if (suggest === "") {
			suggestion_input.value = "";
		}

		let last = words.at(-1);

		if (["Tab", "ShiftTab"].includes(type) && last) {
			let new_position_word = words
				.slice(0, position_word.value + 1)
				.join(" ").length;
			let new_value_input =
				words.join(" ").slice(0, new_position_word - last.length) +
				suggest;
			input_model.value = new_value_input;
			suggestion_input.value = "";
		}
	}

	function word_completer(completion_list: Array<string>, word: string) {
		return completion_list.filter(
			(item) => !item.toLowerCase().indexOf(word.toLowerCase()),
		);
	}

	function submit_handler() {
		position_suggestion.value = -1;
		position_word.value = 0;
		suggestions.value = [];
		suggestion_input.value = "";
	}

	return {
		apply_suggestion_handler,
		input_handler,
		keydown_handler,
		submit_handler,
		suggestion_input: suggestion_input,
	};
}

export function use_input_history(props: Props) {
	let position_arrow = ref(0);
	let history = computed(() => props.room.input_history);

	function keydown_handler(evt: KeyboardEvent) {
		if (!props.room.input_history) {
			return;
		}

		evt.preventDefault();

		if (evt.code === "ArrowDown") {
			position_arrow.value -= 1;
		} else {
			position_arrow.value += 1;
		}

		let v = history.value[history.value.length - 1 - position_arrow.value];
		if (v == null) {
			return;
		}
		input_model.value = v;
	}

	function submit_handler() {
		position_arrow.value = 0;
	}

	watch(position_arrow, (new_value) => {
		if (!history.value) {
			return;
		}

		if (new_value <= -1) {
			position_arrow.value = 0;
		}

		if (new_value >= history.value.length - 1) {
			position_arrow.value = history.value.length - 1;
		}
	});

	return {
		keydown_handler,
		submit_handler,
	};
}

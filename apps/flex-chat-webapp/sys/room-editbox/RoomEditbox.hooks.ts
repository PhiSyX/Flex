// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { ref, watchEffect } from "vue";
import { $input, Props, inputModel } from "./RoomEditbox.state";

// ----- //
// Hooks //
// ----- //

export function useAutocompletion(props: Props) {
	const positionSuggestion = ref(-1);
	const positionWord = ref(0);
	const suggestions = ref([] as Array<string>);
	const suggestionInput = ref("");

	function applySuggestionHandler() {
		inputModel.value = suggestionInput.value;
		suggestionInput.value = "";
		$input.value?.focus();
	}

	function inputHandler(evt: Event) {
		const el = evt.target as HTMLInputElement;
		const word = getWordByPositionCursor(el);

		if (word.length === 0) {
			inputCompleter();
			return;
		}

		suggestions.value = wordCompleter(props.completionList || [], word);

		if (
			word.length >= 1 &&
			inputModel.value.slice(-1) !== " " &&
			suggestions.value.length > 0
		) {
			inputCompleter(suggestions.value[0]);
		} else {
			inputCompleter();
		}
	}

	function keydownHandler(evt: KeyboardEvent) {
		if (inputModel.value.length === 0) return;

		if (["ArrowDown", "ArrowUp"].includes(evt.key)) {
			suggestionInput.value = "";
			return;
		}

		if (evt.key !== "Tab") {
			positionSuggestion.value = -1;
			return;
		}

		const lastSpaceChar = inputModel.value.slice(-1) === " ";

		if (lastSpaceChar) return;

		if (evt.shiftKey) {
			positionSuggestion.value--;
		} else {
			positionSuggestion.value++;
		}

		const ls = suggestions.value.length;

		if (positionSuggestion.value <= -1) {
			positionSuggestion.value = ls - 1;
		}

		if (positionSuggestion.value >= ls) {
			positionSuggestion.value = 0;
		}

		if (suggestions.value.length > 0) {
			evt.preventDefault();
		}

		const ps = positionSuggestion.value;
		const ds = ps % ls;
		const found = suggestions.value[ds];

		if (!found) return;

		inputCompleter(found, evt.shiftKey ? "ShiftTab" : "Tab");
	}

	function getWordByPositionCursor(el: HTMLInputElement) {
		const cursor = el.selectionStart || 0;
		const words = inputModel.value.split(/\s/);

		let word = "";

		for (let idx = 0, count = 0; idx < words.length; idx++) {
			const temp = words[idx];

			count += temp.length + 1;

			if (count >= cursor) {
				positionWord.value = idx;
				word = temp;
			}
		}

		return word;
	}

	function inputCompleter(suggest = "", type = "input") {
		const words = inputModel.value.split(/\s/);
		const parts = inputModel.value.split(/\s/);
		const word = parts[positionWord.value] || "";

		words[positionWord.value] = word + suggest.slice(word.length);
		if (suggestions.value.length > 0) {
			suggestionInput.value = words.join(" ");
		}

		if (suggest === "") {
			suggestionInput.value = "";
		}

		const last = words.at(-1);

		if (["Tab", "ShiftTab"].includes(type) && last) {
			const newPositionWord = words.slice(0, positionWord.value + 1).join(" ").length;
			const newValueInput = words.join(" ").slice(0, newPositionWord - last.length) + suggest;
			inputModel.value = newValueInput;
			suggestionInput.value = "";
		}
	}

	function wordCompleter(completionList: Array<string>, word: string) {
		return completionList.filter((item) => !item.toLowerCase().indexOf(word.toLowerCase()));
	}

	function submitHandler() {
		positionSuggestion.value = -1;
		positionWord.value = 0;
		suggestions.value = [];
		suggestionInput.value = "";
	}

	return {
		applySuggestionHandler,
		autocompletionInputHandler: inputHandler,
		autocompletionKeydownHandler: keydownHandler,
		autocompletionSubmitHandler: submitHandler,
		suggestionInput,
	};
}

export function useInputHistory(props: Props) {
	const positionArrow = ref(0);

	function keydownHandler(evt: KeyboardEvent) {
		if (!props.room.inputHistory) return;

		const history = props.room.inputHistory;

		evt.preventDefault();

		if (evt.code === "ArrowDown") {
			positionArrow.value -= 1;
		} else {
			positionArrow.value += 1;
		}

		const v = history[history.length - 1 - positionArrow.value];
		if (v == null) return;
		inputModel.value = v;
	}

	function submitHandler() {
		positionArrow.value = 0;
	}

	watchEffect(() => {
		if (!history) return;

		if (positionArrow.value <= -1) {
			positionArrow.value = 0;
		}

		if (positionArrow.value >= history.length - 1) {
			positionArrow.value = history.length - 1;
		}
	});

	return {
		historyKeydownHandler: keydownHandler,
		historySubmitHandler: submitHandler,
	};
}

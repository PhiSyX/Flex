// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// --------- //
// Interface //
// --------- //

interface CaretPosition
{
	start: number;
	end: number;
	selected_text: string;
}

// -------- //
// Fonction //
// -------- //

function get_caret_contenteditable(
	$el: HTMLElement,
	{ doc }: { doc: Document } = { doc: document },
): CaretPosition
{
	// biome-ignore lint/style/noNonNullAssertion: c'est ok
	let dom_sel = doc.getSelection() !;
	let range = dom_sel.getRangeAt(0);

	let pre_range = range.cloneRange();
	let post_range = range.cloneRange();

	pre_range.selectNodeContents($el);
	pre_range.setEnd(range.startContainer, range.startOffset);
	post_range.selectNodeContents($el);
	post_range.setStart(range.endContainer, range.endOffset);

	let str_start = pre_range.toString();
	let end_start = range.toString();

	let start_offset = str_start.length;
	let end_offset = start_offset + end_start.length;

	if (start_offset > 0) {
		let child = $el.children.length;
		while (child--) {
			let child_node = $el.children[child];
			if (
				child_node.nodeType === Node.ELEMENT_NODE &&
				child_node.nodeName === "BR"
			) {
				start_offset += pre_range.intersectsNode(child_node) ? 1 : 0;
				end_offset += post_range.intersectsNode(child_node) ? 1 : 0;
			}
		}
	}

	return {
		start: start_offset,
		end: end_offset,
		selected_text: end_start,
	};
}

function set_caret_contenteditable(
	$el: HTMLElement,
	pos: CaretPosition = { start: 0, end: 0, selected_text: "" },
	new_content = "",
	{ doc }: { doc: Document } = { doc: document },
)
{
	let { start = 0, end = 0 } = pos;

	let node: Node | undefined;
	let node_stack: Node[] = [$el];

	let char_idx = 0;

	let found_start = false;
	let stop_recursion = false;

	let range = doc.createRange();
	range.setStart($el, 0);
	range.collapse(true);

	// biome-ignore lint/suspicious/noAssignInExpressions: tranquille mon gars
	while (!stop_recursion && (node = node_stack.pop())) {
		if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
			char_idx++;
		} else if (node.nodeType === Node.TEXT_NODE) {
			// SAFETY(types): voir condition ci-haut.
			let node_text = node as Text;
			let next_char_idx = char_idx + node_text.length;
			if (!found_start && start >= char_idx && start <= next_char_idx) {
				range.setStart(node, start - char_idx);
				found_start = true;
			}

			if (found_start && end >= char_idx && end <= next_char_idx) {
				range.setEnd(node, end - char_idx);
				stop_recursion = true;
			}

			char_idx = next_char_idx;
		} else {
			let child = node.childNodes.length;
			while (child--) {
				node_stack.push(node.childNodes[child]);
			}
		}
	}

	let sel = doc.getSelection();
	sel?.removeAllRanges();
	sel?.addRange(range);

	if (new_content?.length > 0) {
		// @ts-ignore
		if (doc.selection) {
			// @ts-ignore
			doc.selection.createRange().pasteHTML(new_content);
		} else {
			doc.execCommand("insertHTML", false, new_content);
		}
	}
}

// ------ //
// Export //
// ------ //

export { get_caret_contenteditable, set_caret_contenteditable };

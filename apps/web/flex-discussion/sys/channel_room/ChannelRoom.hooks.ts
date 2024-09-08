// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ComputedRef, Ref } from "vue";
import type { Emits, Props } from "./ChannelRoom.template.vue";

import {
	computed,
	nextTick as next_tick,
	ref,
} from "vue";

// -------- //
// Fonction //
// -------- //

function submit_topic(
	emit: Emits,
	props: Props,
	{
		$input,
		topic_edit_mode,
		topic_input,
		current_client_member_can_edit_topic,
	}: {
		$input: Ref<HTMLInputElement | undefined>;
		topic_edit_mode: Ref<boolean>;
		topic_input: Ref<string>;
		current_client_member_can_edit_topic: ComputedRef<boolean>;
	},
)
{
	function submit_topic_handler(evt: Event)
	{
		topic_edit_mode.value = false;

		emit("create-topic-layer", {
			event: evt,
			linked_element: $input.value,
			mode: topic_edit_mode.value,
		});

		evt.preventDefault();

		if (!current_client_member_can_edit_topic.value) {
			return;
		}

		if (topic_input.value === props.room.topic.get()) {
			return;
		}

		emit("update-topic", topic_input.value);
	}

	return submit_topic_handler;
}

function enable_topic_edit_mode(
	_props: Props,
	emit: Emits,
	{
		$topic,
		topic_edit_mode,
		current_client_member_can_edit_topic,
	}: {
		$topic: Ref<HTMLInputElement | undefined>;
		topic_edit_mode: Ref<boolean>;
		current_client_member_can_edit_topic: ComputedRef<boolean>;
	},
)
{
	function enable_topic_edit_mode_handler(evt: Event)
	{
		if (!current_client_member_can_edit_topic.value) {
			return;
		}

		topic_edit_mode.value = true;

		next_tick(() => {
			$topic.value?.focus();
			emit("create-topic-layer", {
				event: evt,
				linked_element: $topic.value,
				mode: topic_edit_mode.value,
			});
		});
	}

	return enable_topic_edit_mode_handler;
}

// ----- //
// Hooks //
// ----- //

export function use_channel_topic(props: Props, emit: Emits)
{
	let $topic = ref<HTMLInputElement>();
	let topic_edit_mode = ref(false);
	let topic_input = ref(props.room.topic.get());

	// Est-ce que le client courant peut éditer le sujet.
	let current_client_member_can_edit_topic = computed(
		() => props.currentClientMember
			.map((member) => props.room.can_edit_topic(member))
			.unwrap_or(false),
	);

	let submit_topic_handler = submit_topic(emit, props, {
		$input: $topic,
		topic_edit_mode,
		topic_input,
		current_client_member_can_edit_topic,
	});

	let enable_topic_edit_mode_handler = enable_topic_edit_mode(props, emit, {
		$topic,
		topic_edit_mode,
		current_client_member_can_edit_topic,
	});

	// watch(topic_edit_mode, (new_value) => {
	// 	if (new_value === false) {
	// 		topic_input.value = props.room.topic.get();
	// 	}
	// });

	return {
		$topic,
		topic_edit_mode,
		topic_input,
		current_client_member_can_edit_topic,
		enable_topic_edit_mode_handler,
		submit_topic_handler,
	};
}

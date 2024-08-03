// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import {
	type ComputedRef,
	type Ref,
	computed,
	nextTick,
	ref,
	watchEffect,
} from "vue";

import type { Emits, Props } from "./ChannelRoom.template.vue";

function submitTopic(
	emit: Emits,
	props: Props,
	{
		$input,
		topicEditMode,
		topicInput,
		currentClientMemberCanEditTopic,
	}: {
		$input: Ref<HTMLInputElement | undefined>;
		topicEditMode: Ref<boolean>;
		topicInput: Ref<string>;
		currentClientMemberCanEditTopic: ComputedRef<boolean>;
	},
) {
	function submitTopicHandler(evt: Event) {
		topicEditMode.value = false;
		emit("create-topic-layer", {
			event: evt,
			linkedElement: $input.value,
			mode: topicEditMode.value,
		});

		evt.preventDefault();

		if (!currentClientMemberCanEditTopic.value) {
			return;
		}

		if (topicInput.value === props.room.topic.get()) {
			return;
		}

		emit("update-topic", topicInput.value);
	}
	return submitTopicHandler;
}

function enableTopicEditMode(
	_props: Props,
	emit: Emits,
	{
		$topic,
		topicEditMode,
		currentClientMemberCanEditTopic,
	}: {
		$topic: Ref<HTMLInputElement | undefined>;
		topicEditMode: Ref<boolean>;
		currentClientMemberCanEditTopic: ComputedRef<boolean>;
	},
) {
	function enableTopicEditModeHandler(evt: Event) {
		if (!currentClientMemberCanEditTopic.value) {
			return;
		}

		topicEditMode.value = true;

		nextTick(() => {
			$topic.value?.focus();
			emit("create-topic-layer", {
				event: evt,
				linkedElement: $topic.value,
				mode: topicEditMode.value,
			});
		});
	}
	return enableTopicEditModeHandler;
}

// ----- //
// Hooks //
// ----- //

export function useChannelTopic(props: Props, emit: Emits) {
	const $topic = ref<HTMLInputElement>();
	const topicEditMode = ref(false);
	const topicInput = ref("");

	// Est-ce que le client courant peut éditer le sujet.
	const currentClientMemberCanEditTopic = computed(() =>
		props.currentClientMember
			.map((member) => props.room.canEditTopic(member))
			.unwrap_or(false),
	);

	const submitTopicHandler = submitTopic(emit, props, {
		$input: $topic,
		topicEditMode,
		topicInput,
		currentClientMemberCanEditTopic,
	});

	const enableTopicEditModeHandler = enableTopicEditMode(props, emit, {
		$topic,
		topicEditMode,
		currentClientMemberCanEditTopic,
	});

	watchEffect(() => {
		if (topicEditMode.value === false) {
			topicInput.value = props.room.topic.get();
		}
	});

	return {
		$topic,
		topicEditMode,
		topicInput,

		currentClientMemberCanEditTopic,
		enableTopicEditModeHandler,
		submitTopicHandler,
	};
}

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
import { Emits, enableTopicEditMode, submitTopic } from "./ChannelRoom.handlers";
import { Props } from "./ChannelRoom.state";

// ----- //
// Hooks //
// ----- //

export function useChannelTopic(props: Props, emit: Emits) {
	const $topic = ref<HTMLInputElement>();
	const topicEditMode = ref(false);
	const topicInput = ref("");

	const submitTopicHandler = submitTopic(emit, props, {
		$input: $topic,
		topicEditMode,
		topicInput,
	});

	const enableTopicEditModeHandler = enableTopicEditMode(props, emit, {
		$topic,
		topicEditMode,
	});

	watchEffect(() => {
		if (topicEditMode.value === false) {
			topicInput.value = props.topic.get();
		}
	});

	return {
		$topic,
		topicEditMode,
		topicInput,

		enableTopicEditModeHandler,
		submitTopicHandler,
	};
}

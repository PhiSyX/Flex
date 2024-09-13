// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Ref } from "vue";

import type { ChannelMember } from "@phisyx/flex-chat";
import type { FuzzySearchRecord } from "@phisyx/flex-search";

import type { Props } from "./ChannelUserlist.template.vue";

import {
	ref,
	shallowRef as shallow_ref,
	watch,
	watchEffect as watch_effect,
} from "vue";

import {
	ChannelMemberFiltered,
	ChannelMemberUnfiltered,
} from "@phisyx/flex-chat";
import { fuzzy_search } from "@phisyx/flex-search";

import ChannelNicklistComponent from "#/sys/channel_nicklist/ChannelNicklist.template.vue";

// ----------- //
// Énumération //
// ----------- //

export enum UserlistModeView {
	Default = "default",
}

// -------- //
// Fonction //
// -------- //

function sort(
	list: Array<ChannelMemberFiltered | ChannelMemberUnfiltered>,
): Array<ChannelMemberFiltered | ChannelMemberUnfiltered> {
	list.sort((l, r) => {
		let lf = l instanceof ChannelMemberFiltered;
		let rf = r instanceof ChannelMemberFiltered;
		if (lf && !rf) {
			return -1;
		}
		if (!lf && rf) {
			return 1;
		}
		if (lf && rf) {
			return l.nickname.toLowerCase() < r.nickname.toLowerCase() ? -1 : 1;
		}
		return l.nickname.toLowerCase() < r.nickname.toLowerCase() ? -1 : 0;
	});
	return list;
}

export function use_inputfilter_userlist(props: Props) {
	let filter_nick = ref("");

	let moderators_filtered = ref(props.members.moderators) as unknown as Ref<
		Array<ChannelMemberFiltered | ChannelMemberUnfiltered>
	>;
	let vips_filtered = ref(props.members.vips) as unknown as Ref<
		Array<ChannelMemberFiltered | ChannelMemberUnfiltered>
	>;
	let users_filtered = ref(props.members.users) as unknown as Ref<
		Array<ChannelMemberFiltered | ChannelMemberUnfiltered>
	>;

	watch_effect(() => {
		if (!filter_nick.value) {
			moderators_filtered.value = [] as Array<ChannelMemberUnfiltered>;
			vips_filtered.value = [] as Array<ChannelMemberUnfiltered>;
			users_filtered.value = [] as Array<ChannelMemberUnfiltered>;
			return;
		}

		let filtered_moderators = props.members.moderators.map(
			(member: ChannelMember) => {
				let test = fuzzy_search(filter_nick.value, member.nickname)
					.map(map_search_record(false))
					.or_else(() =>
						fuzzy_search(
							filter_nick.value,
							member.access_level.highest.symbol,
						).map(map_search_record(true)),
					)
					.unwrap_or([]);
				return test.length === 0
					? new ChannelMemberUnfiltered(member)
					: new ChannelMemberFiltered(member, test);
			},
		);
		let filtered_vips = props.members.vips.map((member: ChannelMember) => {
			let test = fuzzy_search(filter_nick.value, member.nickname)
				.map(map_search_record(false))
				.or_else(() =>
					fuzzy_search(
						filter_nick.value,
						member.access_level.highest.symbol,
					).map(map_search_record(true)),
				)
				.unwrap_or([]);
			return test.length === 0
				? new ChannelMemberUnfiltered(member)
				: new ChannelMemberFiltered(member, test);
		});
		let filtered_users = props.members.users.map(
			(member: ChannelMember) => {
				let test = fuzzy_search(filter_nick.value, member.nickname)
					.map(map_search_record(false))
					.or_else(() =>
						fuzzy_search(
							filter_nick.value,
							member.access_level.highest.symbol,
						).map(map_search_record(true)),
					)
					.unwrap_or([]);
				return test.length === 0
					? new ChannelMemberUnfiltered(member)
					: new ChannelMemberFiltered(member, test);
			},
		);

		let m = filtered_moderators.length;
		let v = filtered_vips.length;
		let u = filtered_users.length;

		if (m === 0 && v === 0 && u === 0) {
			moderators_filtered.value = [] as Array<ChannelMemberUnfiltered>;
			vips_filtered.value = [] as Array<ChannelMemberUnfiltered>;
			users_filtered.value = [] as Array<ChannelMemberUnfiltered>;
		} else {
			moderators_filtered.value = sort(filtered_moderators);
			vips_filtered.value = sort(filtered_vips);
			users_filtered.value = sort(filtered_users);
		}
	});

	return {
		filter_nick,
		moderators_filtered,
		vips_filtered,
		users_filtered,
	};
}

export function use_filter_view() {
	let filter_view = ref(UserlistModeView.Default);
	let view = shallow_ref(ChannelNicklistComponent);

	watch(filter_view, (new_value) => {
		switch (new_value) {
			case UserlistModeView.Default:
				{
					view.value = ChannelNicklistComponent;
				}
				break;
		}
	});

	return { filter_view, view };
}

function map_search_record(is_symbol: boolean) {
	return (records: Array<FuzzySearchRecord>) =>
		records.map((record) => ({ ...record, is_symbol }));
}

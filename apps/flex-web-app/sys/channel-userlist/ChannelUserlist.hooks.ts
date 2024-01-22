// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { FuzzySearchRecord, fuzzy_search } from "@phisyx/flex-search";
import { Ref, ref, shallowRef, watchEffect } from "vue";

import { ChannelNick } from "~/channel/ChannelNick";

import { Props, UserlistModeView } from "./ChannelUserlist.state";

import ChannelNicklist from "#/sys/channel-nicklist/ChannelNicklist.vue";
import { ChannelNickFiltered } from "~/channel/ChannelNickFiltered";

// -------- //
// Fonction //
// -------- //

export function useInputFilterUserlist(props: Props) {
	const filterNick = ref("");

	const moderatorsFiltered = ref(props.users.moderators) as unknown as Ref<
		Array<ChannelNickFiltered>
	>;
	const vipsFiltered = ref(props.users.vips) as unknown as Ref<
		Array<ChannelNickFiltered>
	>;
	const usersFiltered = ref(props.users.users) as unknown as Ref<
		Array<ChannelNickFiltered>
	>;

	watchEffect(() => {
		const filteredModerators = props.users.moderators
			.map((nick: ChannelNick) => {
				const test = fuzzy_search(filterNick.value, nick.nickname)
					.map(map_search_record(false))
					.or_else(() =>
						fuzzy_search(filterNick.value, nick.highestAccessLevel.symbol).map(
							map_search_record(true),
						),
					)
					.unwrap_or([]);
				return new ChannelNickFiltered(nick, test.length === 0 ? [] : test);
			})
			.filter((nick) => nick.searchHits.length > 0);
		const filteredVips = props.users.vips
			.map((nick: ChannelNick) => {
				const test = fuzzy_search(filterNick.value, nick.nickname)
					.map(map_search_record(false))
					.or_else(() =>
						fuzzy_search(filterNick.value, nick.highestAccessLevel.symbol).map(
							map_search_record(true),
						),
					)
					.unwrap_or([]);
				return new ChannelNickFiltered(nick, test.length === 0 ? [] : test);
			})
			.filter((nick) => nick.searchHits.length > 0);
		const filteredUsers = props.users.users
			.map((nick: ChannelNick) => {
				const test = fuzzy_search(filterNick.value, nick.nickname)
					.map(map_search_record(false))
					.or_else(() =>
						fuzzy_search(filterNick.value, nick.highestAccessLevel.symbol).map(
							map_search_record(true),
						),
					)
					.unwrap_or([]);
				return new ChannelNickFiltered(nick, test.length === 0 ? [] : test);
			})
			.filter((nick) => nick.searchHits.length > 0);

		const m = filteredModerators.length;
		const v = filteredVips.length;
		const u = filteredUsers.length;

		if (m === 0 && v === 0 && u === 0) {
			moderatorsFiltered.value = props.users.moderators.map(
				(cnick) => new ChannelNickFiltered(cnick),
			);
			vipsFiltered.value = props.users.vips.map(
				(cnick) => new ChannelNickFiltered(cnick),
			);
			usersFiltered.value = props.users.users.map(
				(cnick) => new ChannelNickFiltered(cnick),
			);
		} else {
			moderatorsFiltered.value = filteredModerators;
			vipsFiltered.value = filteredVips;
			usersFiltered.value = filteredUsers;
		}
	});

	return { filterNick, moderatorsFiltered, vipsFiltered, usersFiltered };
}

export function useFilterView() {
	const filterView = ref(UserlistModeView.Default);
	const view = shallowRef(ChannelNicklist);

	watchEffect(() => {
		switch (filterView.value) {
			case UserlistModeView.Default:
				view.value = ChannelNicklist;
				break;
		}
	});

	return { filterView, view };
}

function map_search_record(isSymbol: boolean) {
	return (records: Array<FuzzySearchRecord>) =>
		records.map((record) => ({ ...record, isSymbol }));
}

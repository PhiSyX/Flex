// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { type FuzzySearchRecord, fuzzy_search } from "@phisyx/flex-search";
import { type Ref, ref, shallowRef, watchEffect } from "vue";

import type { ChannelMember } from "~/channel/ChannelMember";
import type { Props } from "./ChannelUserlist.vue";

import { ChannelMemberFiltered, ChannelMemberUnfiltered } from "~/channel/ChannelMemberFiltered";

import ChannelNicklist from "#/sys/channel-nicklist/ChannelNicklist.vue";

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
		const lf = l instanceof ChannelMemberFiltered;
		const rf = r instanceof ChannelMemberFiltered;
		if (lf && !rf) return -1;
		if (!lf && rf) return 1;
		if (lf && rf) return l.nickname.toLowerCase() < r.nickname.toLowerCase() ? -1 : 1;
		return l.nickname.toLowerCase() < r.nickname.toLowerCase() ? -1 : 0;
	});
	return list;
}

export function useInputFilterUserlist(props: Props) {
	const filterNick = ref("");

	const moderatorsFiltered = ref(props.members.moderators) as unknown as Ref<
		Array<ChannelMemberFiltered | ChannelMemberUnfiltered>
	>;
	const vipsFiltered = ref(props.members.vips) as unknown as Ref<
		Array<ChannelMemberFiltered | ChannelMemberUnfiltered>
	>;
	const usersFiltered = ref(props.members.users) as unknown as Ref<
		Array<ChannelMemberFiltered | ChannelMemberUnfiltered>
	>;

	watchEffect(() => {
		if (!filterNick.value) {
			moderatorsFiltered.value = [] as Array<ChannelMemberUnfiltered>;
			vipsFiltered.value = [] as Array<ChannelMemberUnfiltered>;
			usersFiltered.value = [] as Array<ChannelMemberUnfiltered>;
			return;
		}

		const filteredModerators = props.members.moderators.map((member: ChannelMember) => {
			const test = fuzzy_search(filterNick.value, member.nickname)
				.map(mapSearchRecord(false))
				.or_else(() =>
					fuzzy_search(filterNick.value, member.accessLevel.highest.symbol).map(
						mapSearchRecord(true),
					),
				)
				.unwrap_or([]);
			return test.length === 0
				? new ChannelMemberUnfiltered(member)
				: new ChannelMemberFiltered(member, test);
		});
		const filteredVips = props.members.vips.map((member: ChannelMember) => {
			const test = fuzzy_search(filterNick.value, member.nickname)
				.map(mapSearchRecord(false))
				.or_else(() =>
					fuzzy_search(filterNick.value, member.accessLevel.highest.symbol).map(
						mapSearchRecord(true),
					),
				)
				.unwrap_or([]);
			return test.length === 0
				? new ChannelMemberUnfiltered(member)
				: new ChannelMemberFiltered(member, test);
		});
		const filteredUsers = props.members.users.map((member: ChannelMember) => {
			const test = fuzzy_search(filterNick.value, member.nickname)
				.map(mapSearchRecord(false))
				.or_else(() =>
					fuzzy_search(filterNick.value, member.accessLevel.highest.symbol).map(
						mapSearchRecord(true),
					),
				)
				.unwrap_or([]);
			return test.length === 0
				? new ChannelMemberUnfiltered(member)
				: new ChannelMemberFiltered(member, test);
		});

		const m = filteredModerators.length;
		const v = filteredVips.length;
		const u = filteredUsers.length;

		if (m === 0 && v === 0 && u === 0) {
			moderatorsFiltered.value = [] as Array<ChannelMemberUnfiltered>;
			vipsFiltered.value = [] as Array<ChannelMemberUnfiltered>;
			usersFiltered.value = [] as Array<ChannelMemberUnfiltered>;
		} else {
			moderatorsFiltered.value = sort(filteredModerators);
			vipsFiltered.value = sort(filteredVips);
			usersFiltered.value = sort(filteredUsers);
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

function mapSearchRecord(isSymbol: boolean) {
	return (records: Array<FuzzySearchRecord>) =>
		records.map((record) => ({ ...record, isSymbol }));
}

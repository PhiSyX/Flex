<script setup lang="ts">
import { ChannelAccessLevelFlag } from "@phisyx/flex-chat/channel/access_level";
import { ChannelMember } from "@phisyx/flex-chat/channel/member";
import { ChannelMemberFiltered } from "@phisyx/flex-chat/channel/member/filtered";
import { User } from "@phisyx/flex-chat/user";

import UserlistUserInfo from "../channel_userlist/ChannelUserlistUserInfo.vue";
import ChannelNicklist from "./ChannelNicklist.template.vue";

let origin1: User = new User({
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
});
let origin2: User = new User({
	id: "f-g-h-i-j" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});
let origin3: User = new User({
	id: "k-l-m-n-o" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

let moderators_original = [
	new ChannelMember(origin1).with_access_level(ChannelAccessLevelFlag.Owner),
	new ChannelMember(origin1).with_access_level(
		ChannelAccessLevelFlag.AdminOperator,
	),
	new ChannelMember(origin1).with_access_level(
		ChannelAccessLevelFlag.Operator,
	),
	new ChannelMember(origin1).with_access_level(
		ChannelAccessLevelFlag.HalfOperator,
	),
];
let moderators = {
	original: moderators_original,
	filtered: moderators_original.map(
		(member) => new ChannelMemberFiltered(member, []),
	),
};

let vips_original = [
	new ChannelMember(origin2).with_access_level(ChannelAccessLevelFlag.Vip),
];
let vips = {
	original: vips_original,
	filtered: vips_original.map(
		(member) => new ChannelMemberFiltered(member, []),
	),
};
let users_original = [
	new ChannelMember(origin3).with_access_level(ChannelAccessLevelFlag.User),
];
let users = {
	original: users_original,
	filtered: users_original.map(
		(member) => new ChannelMemberFiltered(member, []),
	),
};
</script>

<template>
	<Story title="Molecules/ChannelNicklist" responsive-disabled>
		<Variant title="Default">
			<ChannelNicklist
				filter-input=""
				:moderators="moderators"
				:vips="vips"
				:users="users"
				:use-icon-instead-of-avatar="true"
			/>
		</Variant>

		<Variant title="Additional User Info">
			<ChannelNicklist
				filter-input=""
				:moderators="moderators"
				:vips="vips"
				:users="users"
				:use-icon-instead-of-avatar="true"
			>
				<template #user-info="{ member: _ }">
					<UserlistUserInfo :age="24" from="Italie" user-flag="IT" />
				</template>
			</ChannelNicklist>
		</Variant>
	</Story>
</template>

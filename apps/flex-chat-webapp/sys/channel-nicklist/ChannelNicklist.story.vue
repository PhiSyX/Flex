<script setup lang="ts">
import { ChannelAccessLevelFlag } from "~/channel/ChannelAccessLevel";
import { ChannelMember } from "~/channel/ChannelMember";
import { ChannelMemberFiltered } from "~/channel/ChannelMemberFiltered";
import { User } from "~/user/User";

import ChannelNicklist from "./ChannelNicklist.vue";

const origin1: User = new User({
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
});
const origin2: User = new User({
	id: "f-g-h-i-j" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});
const origin3: User = new User({
	id: "k-l-m-n-o" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

const moderatorsOriginal = [
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevelFlag.Owner),
	new ChannelMember(origin1).withAccessLevel(
		ChannelAccessLevelFlag.AdminOperator,
	),
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevelFlag.Operator),
	new ChannelMember(origin1).withAccessLevel(
		ChannelAccessLevelFlag.HalfOperator,
	),
];
const moderators = {
	original: moderatorsOriginal,
	filtered: moderatorsOriginal.map(
		(member) => new ChannelMemberFiltered(member, []),
	),
};

const vipsOriginal = [
	new ChannelMember(origin2).withAccessLevel(ChannelAccessLevelFlag.Vip),
];
const vips = {
	original: vipsOriginal,
	filtered: vipsOriginal.map(
		(member) => new ChannelMemberFiltered(member, []),
	),
};
const usersOriginal = [
	new ChannelMember(origin3).withAccessLevel(ChannelAccessLevelFlag.User),
];
const users = {
	original: usersOriginal,
	filtered: usersOriginal.map(
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
			/>
		</Variant>
	</Story>
</template>

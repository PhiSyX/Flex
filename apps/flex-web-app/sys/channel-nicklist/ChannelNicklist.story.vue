<script setup lang="ts">
import { ChannelMember } from "~/channel/ChannelMember";
import ChannelNicklist from "./ChannelNicklist.vue";

import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelMemberFiltered } from "~/channel/ChannelMemberFiltered";
import { User } from "~/user/User";

const origin1: User = new User({
	id: "a-b-c-d-e" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
});
const origin2: User = new User({
	id: "f-g-h-i-j" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});
const origin3: User = new User({
	id: "k-l-m-n-o" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

const moderatorsOriginal = [
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevel.Owner),
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevel.AdminOperator),
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevel.Operator),
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevel.HalfOperator),
];
const moderators = {
	original: moderatorsOriginal,
	filtered: moderatorsOriginal.map((cnick) => new ChannelMemberFiltered(cnick)),
};

const vipsOriginal = [
	new ChannelMember(origin2).withAccessLevel(ChannelAccessLevel.Vip),
];
const vips = {
	original: vipsOriginal,
	filtered: vipsOriginal.map((cnick) => new ChannelMemberFiltered(cnick)),
};
const usersOriginal = [
	new ChannelMember(origin3).withAccessLevel(ChannelAccessLevel.User),
];
const users = {
	original: usersOriginal,
	filtered: usersOriginal.map((cnick) => new ChannelMemberFiltered(cnick)),
};
</script>

<template>
	<Story title="Molecules/ChannelNicklist" responsive-disabled>
		<Variant title="Default">
			<ChannelNicklist
				:moderators="moderators"
				:vips="vips"
				:users="users"
			/>
		</Variant>
	</Story>
</template>

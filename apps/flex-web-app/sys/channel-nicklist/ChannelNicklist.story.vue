<script setup lang="ts">
import { ChannelNick } from "~/channel/ChannelNick";
import ChannelNicklist from "./ChannelNicklist.vue";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { ChannelNickFiltered } from "~/channel/ChannelNickFiltered";
import { User } from "~/user/User";

const origin1: User = new User({
	id: "uuid0",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "ModeratorUser",
});
const origin2: User = new User({
	id: "uuid1",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "VipUser",
});
const origin3: User = new User({
	id: "uuid3",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

const moderatorsOriginal = [
	new ChannelNick(origin1).withAccessLevel(ChannelAccessLevel.Owner),
	new ChannelNick(origin1).withAccessLevel(ChannelAccessLevel.AdminOperator),
	new ChannelNick(origin1).withAccessLevel(ChannelAccessLevel.Operator),
	new ChannelNick(origin1).withAccessLevel(ChannelAccessLevel.HalfOperator),
];
const moderators = {
	original: moderatorsOriginal,
	filtered: moderatorsOriginal.map((cnick) => new ChannelNickFiltered(cnick)),
};

const vipsOriginal = [
	new ChannelNick(origin2).withAccessLevel(ChannelAccessLevel.Vip),
];
const vips = {
	original: vipsOriginal,
	filtered: vipsOriginal.map((cnick) => new ChannelNickFiltered(cnick)),
};
const usersOriginal = [
	new ChannelNick(origin3).withAccessLevel(ChannelAccessLevel.User),
];
const users = {
	original: usersOriginal,
	filtered: usersOriginal.map((cnick) => new ChannelNickFiltered(cnick)),
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

<script setup lang="ts">
import { ChannelNick } from "~/channel/ChannelNick";
import ChannelUserlist from "./ChannelUserlist.vue";
import { ChannelUsers } from "~/channel/ChannelUsers";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { User } from "~/user/User";

const channelName = "#channel";
const users = new ChannelUsers();

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

users.add(new ChannelNick(origin1).withAccessLevel(ChannelAccessLevel.Owner));
users.add(new ChannelNick(origin2).withAccessLevel(ChannelAccessLevel.Vip));
users.add(new ChannelNick(origin3).withAccessLevel(ChannelAccessLevel.User));
</script>

<template>
	<Story title="Molecules/ChannelUserlist" responsive-disabled>
		<Variant title="Default">
			<ChannelUserlist :name="channelName" :users="users" />
		</Variant>
	</Story>
</template>

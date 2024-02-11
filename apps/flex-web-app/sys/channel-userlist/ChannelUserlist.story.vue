<script setup lang="ts">
import { ChannelMember } from "~/channel/ChannelMember";
import ChannelUserlist from "./ChannelUserlist.vue";
import { ChannelMembers } from "~/channel/ChannelMembers";
import { ChannelAccessLevel } from "~/channel/ChannelAccessLevel";
import { User } from "~/user/User";

const channelName = "#channel";
const users = new ChannelMembers();

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

users.add(new ChannelMember(origin1).withAccessLevel(ChannelAccessLevel.Owner));
users.add(new ChannelMember(origin2).withAccessLevel(ChannelAccessLevel.Vip));
users.add(new ChannelMember(origin3).withAccessLevel(ChannelAccessLevel.User));
</script>

<template>
	<Story title="Molecules/ChannelUserlist" responsive-disabled>
		<Variant title="Default">
			<ChannelUserlist :name="channelName" :users="users" />
		</Variant>
	</Story>
</template>

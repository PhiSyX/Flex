<script setup lang="ts">
import {
	ChannelAccessLevelFlag,
	ChannelMember,
	ChannelMembers,
	User,
} from "@phisyx/flex-chat";

import ChannelUserlist from "./ChannelUserlist.template.vue";

const channelName = "#channel";
const users = new ChannelMembers();

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

users.add(
	new ChannelMember(origin1).withAccessLevel(ChannelAccessLevelFlag.Owner),
);
users.add(
	new ChannelMember(origin2).withAccessLevel(ChannelAccessLevelFlag.Vip),
);
users.add(
	new ChannelMember(origin3).withAccessLevel(ChannelAccessLevelFlag.User),
);
</script>

<template>
	<Story title="Molecules/ChannelUserlist" responsive-disabled>
		<Variant title="Default">
			<ChannelUserlist :name="channelName" :members="users" />
		</Variant>
	</Story>
</template>

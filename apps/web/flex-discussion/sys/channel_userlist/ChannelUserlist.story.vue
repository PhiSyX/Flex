<script setup lang="ts">
import {
	ChannelAccessLevelFlag,
	ChannelMember,
	ChannelMembers,
	User,
} from "@phisyx/flex-chat";

import ChannelUserlist from "./ChannelUserlist.template.vue";

let channel_name = "#channel";
let users = new ChannelMembers();

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

users.add(
	new ChannelMember(origin1).with_access_level(ChannelAccessLevelFlag.Owner),
);
users.add(
	new ChannelMember(origin2).with_access_level(ChannelAccessLevelFlag.Vip),
);
users.add(
	new ChannelMember(origin3).with_access_level(ChannelAccessLevelFlag.User),
);
</script>

<template>
	<Story title="Molecules/ChannelUserlist" responsive-disabled>
		<Variant title="Default">
			<ChannelUserlist :name="channel_name" :members="users" />
		</Variant>
	</Story>
</template>

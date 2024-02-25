<script setup lang="ts">
import { ChannelMember } from "~/channel/ChannelMember";

import ChannelUserlistMenu from "./ChannelUserlistMenu.vue";
import { ChannelMemberSelected } from "~/channel/ChannelMemberSelected";
import { User } from "~/user/User";

const origin: User = new User({
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "localhost" },
	ident: "PhiSyX",
	nickname: "PhiSyX",
});

const origin1: User = new User({
	id: "f-g-h-i-j" as UserID,
	host: { cloaked: "localhost" },
	ident: "Ident",
	nickname: "Nick",
});

const me = new ChannelMember(origin);

const user1 = new ChannelMemberSelected(new ChannelMember(origin1), false);
const user2 = new ChannelMemberSelected(new ChannelMember(origin), false);
</script>

<template>
	<Story title="Molecules/ChannelUserlistMenu" responsive-disabled>
		<Variant title="Default">
			<ChannelUserlistMenu
				:current-client-member="me"
				:selected-member="user1"
			/>
		</Variant>

		<Variant title="Me">
			<ChannelUserlistMenu
				:current-client-member="me"
				:selected-member="user2"
			/>
		</Variant>
	</Story>
</template>

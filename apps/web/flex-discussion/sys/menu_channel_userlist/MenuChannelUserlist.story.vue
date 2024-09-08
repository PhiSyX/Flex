<script setup lang="ts">
import { ChannelMember, ChannelMemberSelected, User } from "@phisyx/flex-chat";

import ChannelUserlistMenu from "./MenuChannelUserlist.template.vue";

let origin: User = new User({
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "localhost" },
	ident: "PhiSyX",
	nickname: "PhiSyX",
});

let origin1: User = new User({
	id: "f-g-h-i-j" as UserID,
	host: { cloaked: "localhost" },
	ident: "Ident",
	nickname: "Nick",
});

let me = new ChannelMember(origin);

let user1 = new ChannelMemberSelected(new ChannelMember(origin1), false);
let user2 = new ChannelMemberSelected(new ChannelMember(origin), false);
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

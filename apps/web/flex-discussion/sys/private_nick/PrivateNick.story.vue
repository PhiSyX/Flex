<script lang="ts" setup>
import { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import { User } from "@phisyx/flex-chat/user";

import PrivateNick from "./PrivateNick.template.vue";

let user = User.from({
	id: "0000-0000-0000-0000" as UserID,
	nickname: "PhiSyX",
	ident: "PhiSyX",
	host: {
		cloaked: "cloaked-host",
		vhost: "flex.chat",
	},
});

let participant = new PrivateParticipant(user);
let myself = new PrivateParticipant(user).with_is_current_client(true);
</script>

<template>
	<Story
		title="Atoms/PrivateNick"
		:layout="{ type: 'grid' }"
		responsive-disabled
	>
		<Variant title="Default">
			<PrivateNick :participant="participant" />
		</Variant>

		<Variant title="Prefix">
			<PrivateNick :participant="participant" prefix="*" />
		</Variant>

		<Variant title="Suffix">
			<PrivateNick :participant="participant" suffix=":" />
		</Variant>

		<Variant title="Prefix/Suffix">
			<PrivateNick :participant="participant" prefix="<" suffix=">" />
		</Variant>

		<Variant title="Myself">
			<PrivateNick :participant="myself" />
		</Variant>
	</Story>
</template>

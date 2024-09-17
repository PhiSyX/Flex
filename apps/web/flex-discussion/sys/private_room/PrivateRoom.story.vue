<script setup lang="ts">
import { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import { PrivateRoom } from "@phisyx/flex-chat/private/room";
import { User } from "@phisyx/flex-chat/user";

import PrivateRoomComponent from "./PrivateRoom.template.vue";

let origin: User = new User({
	id: "a-b-c-d-e" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "PhiSyX",
});

let private_room = new PrivateRoom(origin.nickname);

let origin1: User = new User({
	id: "k-l-m-n-o" as UserID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

let disable_input = false;
let me: PrivateParticipant = new PrivateParticipant(origin);
let recipient: PrivateParticipant = new PrivateParticipant(origin1);
</script>

<template>
	<Story title="Organisms/PrivateRoom" responsive-disabled>
		<Variant title="Me">
			<PrivateRoomComponent
				:current-nickname="origin.nickname"
				:is-recipient-blocked="disable_input"
				:current-client-user="me"
				:recipient="me"
				:room="private_room"
			/>
		</Variant>

		<Variant title="User">
			<PrivateRoomComponent
				:current-nickname="origin.nickname"
				:is-recipient-blocked="disable_input"
				:current-client-user="me"
				:recipient="recipient"
				:room="private_room"
			/>
		</Variant>

		<Variant title="User blocked">
			<PrivateRoomComponent
				:current-nickname="origin.nickname"
				:is-recipient-blocked="!disable_input"
				:current-client-user="me"
				:recipient="recipient"
				:room="private_room"
			/>
		</Variant>
	</Story>
</template>

<style>
#app [data-v-app],
.histoire-generic-render-story {
	height: 100%;
	color: var(--default-text-color);
}

#app [data-v-app] > div,
#app [data-v-app] .room\/private {
	height: 100%;
}
</style>

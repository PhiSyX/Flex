<script setup lang="ts">
import { User } from "~/user/User";
import { PrivateNick } from "~/private/PrivateNick";
import { PrivateRoom } from "~/private/PrivateRoom";

import PrivateRoomComponent from "./PrivateRoom.vue";

const origin: User = new User({
	id: "a-b-c-d-e" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "PhiSyX",
});

const privateRoom = new PrivateRoom(origin.nickname);

const origin1: User = new User({
	id: "k-l-m-n-o" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
});

const disableInput = false;
const me: PrivateNick = new PrivateNick(origin);
const recipient: PrivateNick = new PrivateNick(origin1);
</script>

<template>
	<Story title="Organisms/PrivateRoom" responsive-disabled>
		<Variant title="Me">
			<PrivateRoomComponent
				:current-nickname="origin.nickname"
				:is-recipient-blocked="disableInput"
				:current-client-user="me"
				:recipient="me"
				:room="privateRoom"
			/>
		</Variant>

		<Variant title="User">
			<PrivateRoomComponent
				:current-nickname="origin.nickname"
				:is-recipient-blocked="disableInput"
				:current-client-user="me"
				:recipient="recipient"
				:room="privateRoom"
			/>
		</Variant>

		<Variant title="User blocked">
			<PrivateRoomComponent
				:current-nickname="origin.nickname"
				:is-recipient-blocked="!disableInput"
				:current-client-user="me"
				:recipient="recipient"
				:room="privateRoom"
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

.room\/private {
	height: 100%;
}
</style>

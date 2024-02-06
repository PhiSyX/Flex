<script setup lang="ts">
import { User } from "~/user/User";
import PrivateRoom from "./PrivateRoom.vue";
import { PrivateNick } from "~/private/PrivateNick";

const origin: User = new User({
	id: "a-b-c-d-e" as UUID,
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "PhiSyX",
});

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
			<PrivateRoom
				:current-nick="origin.nickname"
				:disable-input="disableInput"
				:me="me"
				:recipient="me"
				:messages="[]"
			/>
		</Variant>

		<Variant title="User">
			<PrivateRoom
				:current-nick="origin.nickname"
				:disable-input="disableInput"
				:me="me"
				:recipient="recipient"
				:messages="[]"
			/>
		</Variant>

		<Variant title="User blocked">
			<PrivateRoom
				:current-nick="origin.nickname"
				:disable-input="true"
				:me="me"
				:recipient="recipient"
				:messages="[]"
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

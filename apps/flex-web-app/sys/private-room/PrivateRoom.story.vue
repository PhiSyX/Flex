<script setup lang="ts">
import PrivateRoom from "./PrivateRoom.vue";
import { PrivateNick } from "~/private/PrivateNick";

const origin: Origin = {
	id: "uuid0",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "PhiSyX",
};

const origin1: Origin = {
	id: "uuid1",
	host: { cloaked: "*" },
	ident: "ident",
	nickname: "User",
};

const disableInput = false;
const me: PrivateNick = new PrivateNick(origin);
const recipient: PrivateNick = new PrivateNick(origin1);
</script>

<template>
	<Story title="Molecules/PrivateRoom" responsive-disabled>
		<Variant title="Me">
			<PrivateRoom
				:disable-input="disableInput"
				:me="me"
				:recipient="me"
				:messages="[]"
			/>
		</Variant>

		<Variant title="User">
			<PrivateRoom
				:disable-input="disableInput"
				:me="me"
				:recipient="recipient"
				:messages="[]"
			/>
		</Variant>

		<Variant title="User blocked">
			<PrivateRoom
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

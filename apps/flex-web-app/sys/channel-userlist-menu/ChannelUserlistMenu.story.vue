<script setup lang="ts">
import { ChannelNick } from "~/channel/ChannelNick";

import ChannelUserlistMenu from "./ChannelUserlistMenu.vue";
import { ChannelSelectedUser } from "~/channel/ChannelSelectedUser";

const origin: Origin = {
	id: "uuid0",
	host: { cloaked: "localhost" },
	ident: "PhiSyX",
	nickname: "PhiSyX",
};

const origin1: Origin = {
	id: "uuid1",
	host: { cloaked: "localhost" },
	ident: "Ident",
	nickname: "Nick",
};

const me = new ChannelNick(origin);

const user1 = new ChannelSelectedUser(new ChannelNick(origin1), false);
const user2 = new ChannelSelectedUser(new ChannelNick(origin), false);
</script>

<template>
	<Story title="Molecules/ChannelUserlistMenu" responsive-disabled>
		<Variant title="Default">
			<ChannelUserlistMenu :me="me" :user="user1" />
		</Variant>

		<Variant title="Me">
			<ChannelUserlistMenu :me="me" :user="user2" />
		</Variant>
	</Story>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;
</style>

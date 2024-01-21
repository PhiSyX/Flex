<script setup lang="ts">
import ChannelUserlist from "./ChannelUserlist.vue";
import { ChannelUsers } from "~/channel/ChannelUsers";

const channelName = "#channel";
const users = new ChannelUsers();
</script>

<template>
	<Story title="Molecules/ChannelUserlist" responsive-disabled>
		<Variant title="Default">
			<ChannelUserlist :name="channelName" :users="users" />
		</Variant>
	</Story>
</template>

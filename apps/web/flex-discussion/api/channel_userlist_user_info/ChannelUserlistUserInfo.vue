<script setup lang="ts">
import type { ChannelUserlistUserInfoViewProps } from "@phisyx/flex-chat-ui";

import {
	ChannelUserlistUserInfoView,
	ChannelUserlistUserInfoWireframe,
} from "@phisyx/flex-chat-ui";
import { useQuery } from "@tanstack/vue-query";
import { computed, reactive, watch } from "vue";

import ChannelUserlistUserInfo from "#/sys/channel_userlist/ChannelUserlistUserInfo.vue";

// --------- //
// Composant //
// --------- //

const {
	privacy = "public",
	endpoint = ChannelUserlistUserInfoView.API_V1_USER_INFO_ENDPOINT,
	userId,
} = defineProps<ChannelUserlistUserInfoViewProps>();

let view = reactive(
	ChannelUserlistUserInfoWireframe.create()
) as ChannelUserlistUserInfoView;

view.define_props({
	// @ts-expect-error - il y a une valeur par défaut.
	endpoint,
	privacy,
	userId,
});

let age = computed(() => view.age);
let country_from = computed(() => view.country_from);
let user_flag = computed(() => view.user_flag);

const { data, isLoading, isError } = useQuery(view.query_api_user());

watch(data, (new_data) => {
	if (isError) {
		return;
	}
	view.set_response_from_api_user({ data: new_data })
});
</script>

<template>
	<ChannelUserlistUserInfo
		v-if="!isLoading"
		:age="age"
		:from="country_from"
		:user-flag="user_flag"
	/>
</template>

<script lang="ts">
// TODO: Récupérer l'URL depuis une les points d'entrées du site.
const API_V1_USER_INFO_ENDPOINT = "/api/v1/users/:userid/info";

const CACHE_MINUTE = import.meta.env.DEV ? 5 : 60;
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { calculate_age } from "@phisyx/flex-date";
import { iso_to_country_flag } from "@phisyx/flex-helpers";

import UserlistUserInfoPresenter from "#/sys/userlist_user_info/UserlistUserInfo.template.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	userId: string;
	// TODO: "private" avec un jeton.
	privacy: "public";
	// NOTE: principalement pour pouvoir mock.
	endpoint?: string;
}

interface UserInfo
{
	birthday?: string;
	country?: string;
	city?: string;
}

// --------- //
// Composant //
// --------- //

const props = withDefaults(defineProps<Props>(), {
	privacy: "public",
	endpoint: API_V1_USER_INFO_ENDPOINT,
});

async function fetcher(): Promise<UserInfo> {
	let res = await fetch(
		// TODO: Créer un URL builder
		`${props.endpoint.replace(":userid", props.userId)}?privacy=${
			props.privacy
		}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			// signal: AbortSignal.any([abort_ctrl.signal, timeout_sig]),
			credentials: "same-origin",
		}
	);
	return res.json();
}

const { data: user_info, isLoading } = useQuery({
	queryKey: [`user_info${props.userId}${props.privacy}`],
	queryFn: fetcher,
	retry: 5,
	retryDelay: 10e3,
	staleTime: CACHE_MINUTE * 6e4,
	refetchInterval: CACHE_MINUTE * 6e4 + 1,
});

let age = computed(() => {
	return user_info.value?.birthday
		? calculate_age(user_info.value.birthday)
		: null;
});

let user_flag = computed(() => {
	if (user_info.value?.country) {
		return iso_to_country_flag(user_info.value.country);
	}
	if (user_info.value?.city) {
		return user_info.value.city
			.split(/[\s-]/g)
			.map((w) => w.slice(0, 1))
			.join("");
	}
	return null;
});
</script>

<template>
	<UserlistUserInfoPresenter
		v-if="!isLoading"
		:age="age"
		:from="user_info?.country || user_info?.city"
		:user-flag="user_flag"
	/>
</template>

<script lang="ts">
// TODO: Récupérer l'URL depuis une les points d'entrées du site.
const API_V1_USER_INFO_ENDPOINT = "/api/v1/users/:userid/info";
</script>

<script setup lang="ts">
import {
	computed,
	onMounted as on_mounted,
	onUnmounted as on_unmounted,
	shallowRef as shallow_ref,
} from "vue";

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

let user_info = shallow_ref<UserInfo | null>();

let timeout_sig = AbortSignal.timeout(5_000);
let abort_ctrl = new AbortController();

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

on_mounted(async () => {
	let response = await fetch(
		// TODO: Créer un URL builder
		`${props.endpoint.replace(":userid", props.userId)}?privacy=${props.privacy}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
			signal: AbortSignal.any([abort_ctrl.signal, timeout_sig]),
			credentials: "same-origin",
		},
	);

	user_info.value = await (response.ok
		? response.json()
		: Promise.reject(`
		Impossible de récupérer les informations de l'utilisateur à l'ID ${props.userId}
	`));
});

on_unmounted(() => {
	if (!abort_ctrl.signal.aborted) {
		abort_ctrl.abort();
	}
});
</script>

<template>
	<UserlistUserInfoPresenter
		:age="age"
		:from="user_info?.country || user_info?.city"
		:user-flag="user_flag"
	/>
</template>

<script setup lang="ts">
import type { InferPageProps } from "@adonisjs/inertia/types";
import type AccountSelfWebController from "#ui/web/account/controller/self";

import { Head, usePage } from "@inertiajs/vue3";
import { computed } from "vue";

import Badge from "@phisyx/flex-uikit-vue/badge/Badge.vue";
import Image from "@phisyx/flex-uikit-vue/image/Image.vue";

type Links = InferPageProps<AccountSelfWebController, "view">["links"];
type User = NonNullable<
	InferPageProps<AccountSelfWebController, "view">["current_user"]
>;

defineProps<{ links: Links }>();

let current_page = usePage();
let current_user = computed(() => current_page.props.current_user as User);

let account_visibilities = {
	private: "Privée",
	public: "Publique",
	secret: "Secret",
};

let avatar_displays = {
	member_only: "Membres uniquement",
	public: "Membres et anonymes",
};

let account_visibility = computed(
	() => account_visibilities[current_user.value.account_status]
);

let avatar_display = computed(
	() => avatar_displays[current_user.value.avatar_display_for]
);
</script>

<template>
	<Head title="Mon compte" />

	<div id="dashboard-page" class="[ mx:a ]">
		<h1>Mon compte</h1>

		<h2 class="[ flex align-i:center gap=1 ]">
			Bienvenue {{ current_user.name }}

			<small>({{ current_user.email }})</small>

			<Badge size="small" color="red" :shadowed="true">
				{{ current_user.role }}
			</Badge>

			<Image
				v-if="current_user.avatar"
				:src="current_user.avatar"
				size="4"
			/>
		</h2>

		<div class="table">
			<table>
				<tbody>
					<tr>
						<td>Visibilité du compte</td>
						<td>{{ account_visibility }}</td>
					</tr>
					<tr>
						<td>Visibilité de l'avatar</td>
						<td>{{ avatar_display }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<style lang="scss">
@use "../../assets/scss/pages/account/self.scss";
</style>

<style lang="scss" scoped>
@use "../../assets/scss/pages/account/self.scoped.scss";
</style>

<script setup lang="ts">
import type AuthLogoutWebController from "#ui/web/auth/controller/logout";
import type { InferPageProps } from "@adonisjs/inertia/types";

import { Head, useForm, usePage } from "@inertiajs/vue3";

type User = InferPageProps<AuthLogoutWebController, "view">["user"];

defineProps<{ user: User }>();

let page = usePage();
let form = useForm({
	identifier: "",
	password: "",
	remember_me: false,
});
</script>

<template>
	<Head title="Déconnexion" />

	<main id="logout-page">
		<p>
			Connecté en tant que
			<strong>{{ user.name }}</strong> <em>({{ user.email }})</em>
		</p>

		<form
			method="post"
			:action="page.url"
			@submit.prevent="form.delete(page.url)"
		>
			<input type="hidden" name="_user_id" :value="user.id" />

			<div class="form-group">
				<button class="btn-submit" type="submit">
					Se déconnecter maintenant
				</button>
			</div>
		</form>
	</main>
</template>

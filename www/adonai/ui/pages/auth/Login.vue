<script setup lang="ts">
import { Head, useForm, usePage } from "@inertiajs/vue3";

let page = usePage();
let form = useForm({
	identifier: "",
	password: "",
	remember_me: false,
});

</script>

<template>
	<Head title="Connexion" />

	<main id="login-page">
		<div v-if="page.props.errors?.global">
			{{ page.props.errors.global }}
		</div>

		<h1>Hello World</h1>

		<form
			method="post"
			:action="page.url"
			@submit.prevent="form.post(page.url)"
		>
			<div
				:class="{
					'is-error': page.props.errors?.identifier,
				}"
			>
				<label for="identifier">Identifiant :</label>
				<input
					v-model="form.identifier"
					type="text"
					name="identifier"
					id="identifier"
				/>
				<span>{{ page.props.errors?.identifier }}</span>
			</div>

			<div
				:class="{
					'is-error': page.props.errors?.password,
				}"
			>
				<label for="password">Mot de passe :</label>
				<input
					v-model="form.password"
					type="password"
					name="password"
					id="password"
				/>
				<span>{{ page.props.errors?.password }}</span>
			</div>

			<div>
				<label for="remember_me">Se souvenir de moi :</label>
				<input
					v-model="form.remember_me"
					type="checkbox"
					name="remember_me"
					id="remember_me"
				/>
			</div>

			<button type="submit">Envoyer</button>
		</form>
	</main>
</template>

<script setup lang="ts">
import type { InferPageProps } from "@adonisjs/inertia/types";
import type AuthSignupWebController from "#ui/web/auth/controller/signup";

import { Head, useForm, usePage } from "@inertiajs/vue3";
import { watch } from "vue";

import Alert from "@phisyx/flex-uikit-vue/alert/Alert.vue";
import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import TextInput from "@phisyx/flex-uikit-vue/textinput/TextInput.vue";
import InertiaLink from "../../components/link/InertiaLink.vue";

type Links = InferPageProps<AuthSignupWebController, "view">["links"];
defineProps<{ links: Links }>();

let page = usePage();
let form = useForm({
	username: "",
	email: "",
	password: "",
	password_confirmation: "",
	remember_me: false,
});

function try_auth() {
	form.post(page.url);
}

watch(
	() => page.props.errors?.global,
	(is_err) => {
		if (is_err) {
			form.reset();
		}
	}
);
</script>

<template>
	<Head title="Connexion" />

	<main
		id="signup-page"
		class="[ scroll:y flex! flex/center:full mx:a pos-r ]"
	>
		<section class="[ flex! gap=3 min-w=43 ]">
			<h1 class="[ f-size=24px ]">Inscription</h1>

			<Alert
				v-if="page.props.errors?.global"
				:closable="false"
				:close-after-seconds="10"
				type="error"
			>
				{{ page.props.errors.global }}
			</Alert>

			<form
				:action="page.url"
				id="signup-form"
				method="POST"
				class="[ ov:h flex! border/radius=1 ]"
				@submit.prevent="try_auth"
			>
				<TextInput
					v-model="form.username"
					:error="page.props.errors?.username?.[0]"
					label="user"
					name="username"
					placeholder="Nom d'utilisateur"
				/>

				<TextInput
					v-model="form.email"
					:error="page.props.errors?.email?.[0]"
					label="email"
					name="email"
					placeholder="Adresse mail"
				/>

				<TextInput
					v-model="form.password"
					:error="page.props.errors?.password?.[0]"
					label="password"
					name="password"
					type="password"
					placeholder="Mot de passe"
				/>

				<TextInput
					v-model="form.password_confirmation"
					:error="page.props.errors?.password_confirmation?.[0]"
					label="password"
					name="password_confirmation"
					type="password"
					placeholder="Confirmation du mot de passe"
				/>
			</form>

			<Button
				icon-position="right"
				type="submit"
				form="signup-form"
				class="[ flex align-jc:se p=2 b:none cursor:pointer ]"
			>
				<span class="[ flex:full ]">S'inscrire</span>
			</Button>

			<hr class="[ w:full ]" text="ou">

			<InertiaLink :href="links.login.href" class="[ p=2 ]" as="button">
				<span class="[ flex:full ]">Aller à la page de connexion</span>
			</InertiaLink>
		</section>
	</main>
</template>

<style lang="scss">
@use "../../assets/scss/pages/auth/signup.scss";
</style>

<style lang="scss" scoped>
@use "../../assets/scss/pages/auth/signup.scoped.scss";
</style>

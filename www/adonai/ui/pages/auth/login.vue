<script setup lang="ts">
import type { InferPageProps } from "@adonisjs/inertia/types";
import type AuthLoginWebController from "#ui/web/auth/controller/login";

import { Head, useForm, usePage } from "@inertiajs/vue3";
import { watch } from "vue";

import Alert from "@phisyx/flex-uikit-vue/alert/Alert.vue";
import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import InputLabelSwitch from "@phisyx/flex-uikit-vue/input/InputLabelSwitch.vue";
import TextInput from "@phisyx/flex-uikit-vue/textinput/TextInput.vue";
import InertiaLink from "../../components/link/InertiaLink.vue";

type Links = InferPageProps<AuthLoginWebController, "view">["links"];

let page = usePage();
let form = useForm({
	identifier: "",
	password: "",
	remember_me: false,
});

defineProps<{ links: Links }>();

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
		id="login-page"
		class="[ scroll:y flex! flex/center:full mx:a pos-r ]"
	>
		<section class="[ flex! gap=3 min-w=43 ]">
			<h1 class="[ f-size=24px ]">Connexion</h1>

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
				id="login-form"
				method="POST"
				class="[ ov:h flex! border/radius=1 ]"
				@submit.prevent="try_auth"
			>
				<TextInput
					v-model="form.identifier"
					:error="page.props.errors?.identifier?.[0]"
					label="user"
					name="identifier"
					placeholder="Nom d'utilisateur ou adresse mail"
				/>

				<TextInput
					v-model="form.password"
					:error="page.props.errors?.password?.[0]"
					label="password"
					name="password"
					type="password"
					placeholder="Mot de passe"
				/>
			</form>

			<div class="remember-me [ mx:a align-t:center f-size=14px w=35 ]">
				<label>
					Connexion automatique lors de tes prochaines sessions :
				</label>

				<InputLabelSwitch
					v-model="form.remember_me"
					label-n="Non"
					label-y="Oui"
					name="remember_me"
					form="login-form"
				/>
			</div>

			<Button
				icon-position="right"
				type="submit"
				form="login-form"
				class="[ flex align-jc:se p=2 b:none cursor:pointer ]"
			>
				<span class="[ flex:full ]">Se connecter</span>
			</Button>

			<hr class="w:full" text="OU">

			<InertiaLink :href="links.register.href" as="button" class="[ p=2 ]">
				Je n'ai pas de compte
			</InertiaLink>
		</section>
	</main>
</template>

<style lang="scss">
@use "../../assets/scss/pages/auth/login.scss";
</style>

<style lang="scss" scoped>
@use "../../assets/scss/pages/auth/login.scoped.scss";
</style>

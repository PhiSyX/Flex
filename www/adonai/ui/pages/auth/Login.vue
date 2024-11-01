<script setup lang="ts">
import { Head, useForm, usePage } from "@inertiajs/vue3";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import InputLabelSwitch from "@phisyx/flex-uikit-vue/input/InputLabelSwitch.vue";
import TextInput from "@phisyx/flex-uikit-vue/textinput/TextInput.vue";

let page = usePage();
let form = useForm({
	identifier: "",
	password: "",
	remember_me: false,
});
</script>

<template>
	<Head title="Connexion" />

	<main
		id="login-page"
		class="[ scroll:y flex! flex/center:full mx:a pos-r ]"
	>
		<section class="[ flex! gap=3 min-w=43 ]">
			<div v-if="page.props.errors?.global">
				{{ page.props.errors.global }}
			</div>

			<h1 class="[ f-size=24px ]">Se connecter</h1>

			<form
				:action="page.url"
				id="login-form"
				method="POST"
				class="[ ov:h flex! border/radius=1 ]"
				@submit.prevent="form.post(page.url)"
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
		</section>
	</main>
</template>

<style lang="scss">
@use "../../assets/scss/pages/auth/login.scss";
</style>

<style lang="scss" scoped>
@use "../../assets/scss/pages/auth/login.scoped.scss";
</style>

<script setup lang="ts">
import {
	ButtonIcon,
	InputSwitch,
	TextInput,
	UiButton,
} from "@phisyx/flex-uikit";

import {
	MAXLENGTH_NICKNAME,
	PLACEHOLDER_NICKNAME,
	VALIDATION_NICKNAME_INFO,
} from "./LoginView.constants";
import {
	connectSubmit,
	displayAdvancedInfoHandler,
} from "./LoginView.handlers";
import { advancedInfo, errors, loader, loginFormData } from "./LoginView.state";
import { useRememberMe } from "./LoginView.hooks";

import ModulesProgress from "~/components/progress/ModulesProgress.vue";

// ---- //
// Type //
// ---- //

interface Props {
	isConnected: boolean;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();
const isConnected = defineModel<boolean>("isConnected");

const submitHandler = connectSubmit(isConnected);

useRememberMe();
</script>

<template>
	<main id="chat-login-view" class="[ scroll:y flex! flex/center:full m:a ]">
		<section class="[ flex! gap=3 min-w=43 ]">
			<h1>Accès direct au Chat</h1>

			<form
				id="chat-login-form"
				action="/chat/login"
				method="POST"
				class="[ ov:h flex! border/radius=1 ]"
				@submit="submitHandler"
			>
				<TextInput
					v-show="advancedInfo"
					v-model="loginFormData.websocketServerURL"
					label="url"
					name="server"
					placeholder="URL WebSocket du serveur de Chat"
					type="url"
				/>

				<TextInput
					v-show="advancedInfo"
					v-model="loginFormData.passwordServer"
					label="password"
					name="password"
					placeholder="Mot de passe du serveur de Chat"
					type="password"
				/>

				<TextInput
					v-model="loginFormData.nickname"
					label="user"
					name="nickname"
					:error="errors.nickname"
					:maxlength="MAXLENGTH_NICKNAME"
					:placeholder="PLACEHOLDER_NICKNAME"
					:title="VALIDATION_NICKNAME_INFO"
				/>

				<TextInput
					v-show="advancedInfo"
					v-model="loginFormData.alternativeNickname"
					label="user"
					name="alternative_nickname"
					:error="errors.alternativeNickname"
					placeholder="Pseudonyme alternatif"
					:maxlength="MAXLENGTH_NICKNAME"
					:title="VALIDATION_NICKNAME_INFO"
				/>

				<TextInput
					v-show="advancedInfo"
					v-model="loginFormData.realname"
					label="user"
					name="realname"
					placeholder="Nom réel"
				/>

				<TextInput
					v-model="loginFormData.channels"
					label="channel"
					name="channels"
				/>
			</form>

			<div class="[ align-t:center ]" v-if="!advancedInfo">
				<ButtonIcon
					icon="plus"
					title="Afficher les champs avancés"
					@click="displayAdvancedInfoHandler"
				/>
			</div>

			<div class="remember-me [ m:a align-t:center w=35 ]">
				<label>
					Connexion automatique lors de vos prochaines sessions :
				</label>

				<InputSwitch
					v-model="loginFormData.rememberMe.value"
					labelN="Non"
					labelY="Oui"
					name="remember_me"
				/>
			</div>

			<UiButton
				:icon="loader ? 'loader' : undefined"
				position="right"
				type="submit"
				form="chat-login-form"
				class="[ flex align-jc:se p=2 b:none cursor:pointer ]"
			>
				<span class="[ flex:full ]">Accéder au Chat</span>
			</UiButton>
		</section>

		<ModulesProgress />
	</main>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

body:has(#chat-login-view) {
	--body-bg: var(--login-page-bg);
}

#chat-login-view {
	h1 {
		font-size: 24px;
	}

	form {
		gap: 1px;
		border: fx.space(1) solid var(--login-form-bg);
		box-shadow: 2px 2px 4px var(--login-form-shadow);
	}

	form div {
		background: var(--login-form-bg);
	}

	form input {
		flex-grow: 1;

		background: transparent;
		border: 0;
		outline: 0;
		color: var(--login-form-color);

		&:focus {
			color: var(--login-form-hover-color);
		}
	}

	form[id] ~ button[form][type="submit"] {
		border-radius: 4px;
		background: var(--login-button-submit-bg);
		transition: background-color 200ms;
		color: var(--login-button-submit-color);

		svg {
			max-width: fx.space(3);
		}

		&:focus-visible {
			outline: 3px inset var(--login-button-submit-outline-color);
		}

		&:active {
			outline: 3px outset var(--login-button-submit-outline-color);
		}

		&:hover {
			--login-button-submit-bg: var(--login-button-submit-bg-hover);
		}

		&:disabled {
			background: var(--disabled-bg);
			color: var(--disabled-color);
			pointer-events: none;
		}
	}
}

.remember-me {
	font-size: 14px;
	line-height: 1.2;
}
</style>

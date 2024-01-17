<script setup lang="ts">
import { ButtonIcon, InputSwitch, TextInput } from "@phisyx/flex-uikit";

import {
	MAXLENGTH_NICKNAME,
	PLACEHOLDER_NICKNAME,
	VALIDATION_NICKNAME_INFO,
} from "./constant";
import { connectSubmit, displayAdvancedInfoHandler } from "./handlers";
import { advancedInfo, loginFormData } from "./state";
import { useRememberMe } from "./hooks";

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
	<main id="chat-login-view" class="[ scroll:y ]">
		<section>
			<h1>Accès direct au Chat</h1>

			<form
				id="chat-login-form"
				action="/chat/login"
				method="POST"
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
					:maxlength="MAXLENGTH_NICKNAME"
					:placeholder="PLACEHOLDER_NICKNAME"
					:title="VALIDATION_NICKNAME_INFO"
				/>

				<TextInput
					v-show="advancedInfo"
					v-model="loginFormData.alternativeNickname"
					label="user"
					name="alternative_nickname"
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

			<div id="display-advanced-info" v-if="!advancedInfo">
				<ButtonIcon
					icon="plus"
					title="Afficher les champs avancés"
					@click="displayAdvancedInfoHandler"
				/>
			</div>

			<div class="remember-me">
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

			<button class="btn" form="chat-login-form" type="submit">
				Accéder au Chat
			</button>
		</section>
	</main>
</template>

<style lang="scss">
@use "scss:~/flexsheets" as fx;

#chat-login-view {
	display: flex;
	flex-direction: column;

	place-content: center;
	place-items: center;

	margin-inline: auto;

	section {
		display: flex;
		flex-direction: column;
		gap: fx.space(3);

		min-width: fx.space(340);
	}

	h1 {
		font-size: 24px;
	}

	form {
		overflow: hidden;

		display: flex;
		flex-direction: column;
		gap: 1px;

		border-radius: fx.space(1);
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
		padding: fx.space(2);

		border: 0;
		border-radius: 4px;
		background: var(--login-button-submit-bg);
		cursor: pointer;

		&:focus-visible {
			outline: 3px inset var(--login-button-submit-outline-color);
		}

		&:active {
			outline: 3px outset var(--login-button-submit-outline-color);
		}

		&:hover {
			@include fx.theme using($name) {
				@if $name == ice {
					--login-button-submit-bg: var(
						-- login-button-submit-bg-hover
					);
				}
			}
		}
	}
}

#display-advanced-info {
	text-align: center;
}

.remember-me {
	width: fx.space(280);

	font-size: 14px;
	line-height: 1.2;

	margin-inline: auto;

	text-align: center;
}
</style>

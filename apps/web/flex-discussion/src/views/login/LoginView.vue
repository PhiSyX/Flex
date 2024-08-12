<script setup lang="ts">
import type { ModelRef } from "vue";

import { reactive, ref } from "vue";

import {
	MAXLENGTH_NICKNAME,
	PLACEHOLDER_NICKNAME,
	RememberMeStorage,
	VALIDATION_NICKNAME_INFO,
	View,
	cast_to_channel_id
} from "@phisyx/flex-chat";
import {
	ButtonIcon,
	InputSwitch,
	TextInput,
	UiButton,
} from "@phisyx/flex-vue-uikit";

import { use_chat_store } from "~/store";

import ModulesProgress from "~/components/progress/ModulesProgress.vue";

// --------- //
// Composant //
// --------- //

let change_view = defineModel<View>("changeView");

let chat_store = use_chat_store();

let advanced_info = ref(false);
let login_form_data = reactive({
	alternative_nickname: import.meta.env.VITE_APP_NICKNAME
		? `${import.meta.env.VITE_APP_NICKNAME}_`
		: "",
	channels: import.meta.env.VITE_APP_CHANNELS || cast_to_channel_id(""),
	nickname: import.meta.env.VITE_APP_NICKNAME || "",
	realname: import.meta.env.VITE_APP_REALNAME || "Flex Web App",
	remember_me: new RememberMeStorage(),
	password_server: import.meta.env.VITE_APP_PASSWORD_SERVER || null,
	websocket_server_url: import.meta.env.VITE_APP_WEBSOCKET_URL,
});
let errors = reactive({
	nickname: null as string | null,
	alternative_nickname: null as string | null,
});
let loader = ref(false);

// ------- //
// Handler //
// ------- //

const submit_handler = connect_submit(change_view);

/**
 * Affiche les informations de connexion avancées.
 */
function display_advanced_info_handler()
{
	advanced_info.value = true;
}

/**
 * Soumission du formulaire. S'occupe de se connecter au serveur de Chat.
 */
function connect_submit(change_view_model: ModelRef<View | undefined, string>)
{
	async function connect_submit_handler(evt: Event)
	{
		evt.preventDefault();

		loader.value = true;

		await chat_store.store.load_all_modules();

		chat_store.connect(login_form_data);

		chat_store.listen(
			"RPL_WELCOME",
			() => reply_welcome_handler(change_view_model),
			{
				once: true,
			},
		);

		chat_store.listen("ERR_NICKNAMEINUSE", (data) =>
			error_nicknameinuse_handler(data),
		);
	}

	return connect_submit_handler;
}

/**
 * Écoute de l'événement `RPL_WELCOME`.
 */
function reply_welcome_handler(change_view_model: ModelRef<View | undefined, string>)
{
	loader.value = false;
	change_view_model.value = View.Chat;
}

/**
 * Écoute de l'événement `ERR_NICKNAMEINUSE`.
 */
function error_nicknameinuse_handler(data: GenericReply<"ERR_NICKNAMEINUSE">)
{
	if (data.nickname === login_form_data.alternative_nickname) {
		errors.alternative_nickname = data.reason.slice(
			login_form_data.alternative_nickname.length + 2,
		);
	} else {
		errors.nickname = data.reason.slice(login_form_data.nickname.length + 2);
	}

	loader.value = false;
}

function to_settings_view_handler()
{
	change_view.value = View.Settings;
}
</script>

<template>
	<main id="chat-login-view" class="[ scroll:y flex! flex/center:full m:a pos-r ]">
		<section class="[ flex! gap=3 min-w=43 ]">
			<h1>Accès direct au Chat</h1>

			<form
				id="chat-login-form"
				action="/chat/login"
				method="POST"
				class="[ ov:h flex! border/radius=1 ]"
				@submit="submit_handler"
			>
				<TextInput
					v-show="advanced_info"
					v-model="login_form_data.websocket_server_url"
					label="url"
					name="server"
					placeholder="URL WebSocket du serveur de Chat"
					type="url"
				/>

				<TextInput
					v-show="advanced_info"
					v-model="login_form_data.password_server"
					label="password"
					name="password_server"
					placeholder="Mot de passe du serveur de Chat"
					type="password"
				/>

				<TextInput
					v-model="login_form_data.nickname"
					label="user"
					name="nickname"
					:error="errors.nickname"
					:maxlength="MAXLENGTH_NICKNAME"
					:placeholder="PLACEHOLDER_NICKNAME"
					:title="VALIDATION_NICKNAME_INFO"
				/>

				<TextInput
					v-show="advanced_info"
					v-model="login_form_data.alternative_nickname"
					label="user"
					name="alternative_nickname"
					:error="errors.alternative_nickname"
					placeholder="Pseudonyme alternatif"
					:maxlength="MAXLENGTH_NICKNAME"
					:title="VALIDATION_NICKNAME_INFO"
				/>

				<TextInput
					v-show="advanced_info"
					v-model="login_form_data.realname"
					label="user"
					name="realname"
					placeholder="Nom réel"
				/>

				<TextInput
					v-model="login_form_data.channels"
					label="channel"
					name="channels"
				/>
			</form>

			<div class="[ align-t:center ]" v-if="!advanced_info">
				<ButtonIcon
					icon="plus"
					title="Afficher les champs avancés"
					@click="display_advanced_info_handler"
				/>
			</div>

			<div class="remember-me [ m:a align-t:center w=35 ]">
				<label>
					Connexion automatique lors de tes prochaines sessions :
				</label>

				<InputSwitch
					v-model="login_form_data.remember_me.value"
					label-n="Non"
					label-y="Oui"
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

		<UiButton icon="settings" class="color-scheme" @click="to_settings_view_handler" />

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

.color-scheme {
	position: absolute;
	top: fx.space(1);
	right: fx.space(1);

	padding: 2px;
	background: var(--login-button-submit-bg);
	color: var(--default-text-color_alt);
	border-radius: 4px;
	font-size: 14px;

	&:hover {
		background: var(--login-button-submit-bg-hover);
	}
}
</style>

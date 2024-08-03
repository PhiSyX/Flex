
<script setup lang="ts">
import type { ModelRef } from "vue";

import type { UserSession } from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

import { computed, onMounted, reactive, ref } from "vue";

import {
	RememberMeStorage,
	View,
	channelID,
} from "@phisyx/flex-chat";
import {
	ButtonIcon,
	InputSwitch,
	TextInput,
	UiButton,
} from "@phisyx/flex-vue-uikit";

import { useChatStore } from "~/store";

// ---- //
// Type //
// ---- //

interface Props 
{
	changeView: View;
	user: Option<UserSession>;
}

// -------- //
// Constant //
// -------- //

/**
 * Attribut `title` de l'élément `<input name="nickname">`.
 *
 * Utilisé pour indiquer à l'utilisateur la valeur attendue pour un pseudonyme.
 */
 const VALIDATION_NICKNAME_INFO: string = `
Pour qu'un pseudonyme soit considéré comme valide, ses caractères doivent
respecter, un format précis, les conditions suivantes :
	- Il ne doit pas commencer par le caractère '-' ou par un caractère
	  numérique '0..9' ;
	- Il peut contenir les caractères: alphanumériques, 'A..Z', 'a..z',
	  '0..9'. Les caractères alphabétiques des langues étrangères sont
	  considérés comme valides. Par exemple: le russe, le japonais, etc.
	- Il peut contenir les caractères spéciaux suivants: []\`_^{|}
`.trim();

/**
 * Attribut `maxlength` de l'élément `<input name="nickname">`.
 *
 * Taille maximale d'un pseudonyme.
 */
const MAXLENGTH_NICKNAME: number = 30;

/**
 * Attribut `placeholder` de l'élément `<input name="nickname">`.
 */
const PLACEHOLDER_NICKNAME: string = `Pseudonyme (max. ${MAXLENGTH_NICKNAME} caractères)`;

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
let changeView = defineModel<View>("changeView");

let user = computed(() => props.user.unwrap());

let chat_store = useChatStore();

let advanced_info = ref(false);
let login_form_data = reactive({
	alternativeNickname: `${user.value.name}_`,
	channels: import.meta.env.VITE_APP_CHANNELS || channelID(""),
	nickname: user.value.name,
	realname: `${user.value.role} - ${user.value.id}`,
	rememberMe: new RememberMeStorage(),
	passwordServer: import.meta.env.VITE_APP_PASSWORD_SERVER || null,
	websocketServerURL: import.meta.env.VITE_APP_WEBSOCKET_URL,
});
let errors = reactive({
	nickname: null as string | null,
	alternativeNickname: null as string | null,
});
let loader = ref(false);

// --------- //
// Lifecycle // -> Hooks
// --------- //

onMounted(() => {
	chat_store.store.setUserID(user.value.id);
	if (login_form_data.rememberMe.get()) {
		submit_handler();
	}
});

// ------- //
// Handler //
// ------- //

const submit_handler = connect_submit(changeView);

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
function connect_submit(changeViewModel: ModelRef<View | undefined, string>) 
{
	async function connect_submit_handler(evt?: Event) {
		evt?.preventDefault();

		loader.value = true;

		await chat_store.store.loadAllModules();

		chat_store.connect(login_form_data);

		chat_store.listen(
			"RPL_WELCOME",
			() => reply_welcome_handler(changeViewModel),
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
function reply_welcome_handler(changeViewModel: ModelRef<View | undefined, string>) 
{
	loader.value = false;
	changeViewModel.value = View.Chat;
}

/**
 * Écoute de l'événement `ERR_NICKNAMEINUSE`.
 */
function error_nicknameinuse_handler(data: GenericReply<"ERR_NICKNAMEINUSE">) 
{
	if (data.nickname === login_form_data.alternativeNickname) {
		errors.alternativeNickname = data.reason.slice(
			login_form_data.alternativeNickname.length + 2,
		);
	} else {
		errors.nickname = data.reason.slice(login_form_data.nickname.length + 2);
	}

	loader.value = false;
}

function to_settings_view_handler() {
	changeView.value = View.Settings;
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
					v-model="login_form_data.websocketServerURL"
					label="url"
					name="server"
					placeholder="URL WebSocket du serveur de Chat"
					type="url"
				/>

				<TextInput
					v-show="advanced_info"
					v-model="login_form_data.passwordServer"
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
					v-model="login_form_data.alternativeNickname"
					label="user"
					name="alternative_nickname"
					:error="errors.alternativeNickname"
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
					Connexion automatique lors de vos prochaines sessions :
				</label>

				<InputSwitch
					v-model="login_form_data.rememberMe.value"
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

		<UiButton icon="settings" class="color-scheme" @click="to_settings_view_handler" />
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

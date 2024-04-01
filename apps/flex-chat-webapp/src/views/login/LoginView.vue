<script setup lang="ts">
import { ButtonIcon, InputSwitch, TextInput, UiButton } from "@phisyx/flex-uikit";
import { type ModelRef, onMounted, reactive, ref } from "vue";

import { useChatStore } from "~/store/ChatStore";
import { RememberMeStorage } from "~/store/local-storage/RememberMeStorage";

import { channelID } from "~/asserts/room";
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

const submitHandler = connectSubmit(isConnected);

const chatStore = useChatStore();

const advancedInfo = ref(false);
const loginFormData = reactive({
	alternativeNickname: import.meta.env.VITE_APP_NICKNAME
		? `${import.meta.env.VITE_APP_NICKNAME}_`
		: "",
	channels: import.meta.env.VITE_APP_CHANNELS || channelID(""),
	nickname: import.meta.env.VITE_APP_NICKNAME || "",
	realname: import.meta.env.VITE_APP_REALNAME || "Flex Web App",
	rememberMe: new RememberMeStorage(),
	passwordServer: import.meta.env.VITE_APP_PASSWORD_SERVER || null,
	websocketServerURL: import.meta.env.VITE_APP_WEBSOCKET_URL,
});
const errors = reactive({
	nickname: null as string | null,
	alternativeNickname: null as string | null,
});
const loader = ref(false);

// ------- //
// Handler //
// ------- //

/**
 * Affiche les informations de connexion avancées.
 */
function displayAdvancedInfoHandler() {
	advancedInfo.value = true;
}

/**
 * Soumission du formulaire. S'occupe de se connecter au serveur de Chat.
 */
function connectSubmit(isConnectedModel: ModelRef<boolean | undefined, string>) {
	async function connectSubmitHandler(evt: Event) {
		evt.preventDefault();

		loader.value = true;

		await chatStore.store.loadAllModules();

		chatStore.connect(loginFormData);

		chatStore.listen("RPL_WELCOME", () => replyWelcomeHandler(isConnectedModel), {
			once: true,
		});

		chatStore.listen("ERR_NICKNAMEINUSE", (data) => errorNicknameinuseHandler(data));
	}

	return connectSubmitHandler;
}

/**
 * Écoute de l'événement `RPL_WELCOME`.
 */
function replyWelcomeHandler(isConnectedModel: ModelRef<boolean | undefined, string>) {
	loader.value = false;
	isConnectedModel.value = true;
}

/**
 * Écoute de l'événement `ERR_NICKNAMEINUSE`.
 */
function errorNicknameinuseHandler(data: GenericReply<"ERR_NICKNAMEINUSE">) {
	if (data.nickname === loginFormData.alternativeNickname) {
		errors.alternativeNickname = data.reason.slice(
			loginFormData.alternativeNickname.length + 2,
		);
	} else {
		errors.nickname = data.reason.slice(loginFormData.nickname.length + 2);
	}

	loader.value = false;
}

onMounted(async () => {
	const fetchOpts: RequestInit = { credentials: "same-origin" };

	const currentUser = await fetch("/api/v1/users/@me", fetchOpts).then(async (r) => {
		if (r.ok) return r.json();
		if (r.status >= 400 && r.status < 600) return Promise.reject(await r.json());
		return Promise.reject(r);
	});

	loginFormData.nickname = currentUser.name;
	loginFormData.alternativeNickname = `${currentUser.name}_`;
	loginFormData.realname = `${currentUser.name} - ${currentUser.role}`;

	chatStore.store.setUserID(currentUser.id);
});
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

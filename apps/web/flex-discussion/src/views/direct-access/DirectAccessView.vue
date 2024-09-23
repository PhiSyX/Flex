<script setup lang="ts">
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	UserStore,
} from "@phisyx/flex-chat/store";

import {
	DirectAccessView,
	DirectAccessWireframe,
} from "@phisyx/flex-chat-ui/views/direct_access";
import { HANDLERS } from "@phisyx/flex-chat/handlers";
import { RememberMeStorage } from "@phisyx/flex-chat/localstorage/remember_me";
import { MODULES_REPLIES_HANDLERS } from "@phisyx/flex-chat/modules";
import { InputSwitch, Match, TextInput, UiImage } from "@phisyx/flex-vue-uikit";
import { computed, onMounted, reactive, watch } from "vue";
import { VueRouter } from "~/router";
import { use_chat_store, use_overlayer_store, use_user_store } from "~/store";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let user_store = use_user_store().store;
let overlayer_store = use_overlayer_store().store;
let router = new VueRouter();

let view = reactive(
	DirectAccessWireframe.create(
		router,
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		user_store as unknown as UserStore,
		overlayer_store as unknown as OverlayerStore,
		HANDLERS,
		MODULES_REPLIES_HANDLERS,
	),
);

let user_session = computed(() => view.user_session);

// TODO: déplacer le texte dans `DirectAccessView`.
let image_title_attribute = computed(() => {
	return user_session.value
		.map((user) => {
			return (
				// biome-ignore lint/style/useTemplate: je ne veux pas utiliser le template literal ici.
				`Bonjour, tu es actuellement connecté en tant que ${user.name}.` +
				"\n\nClique sur cette image pour modifier ton profil, si tu le souhaites."
			);
		})
		.unwrap_or("");
});

onMounted(() => {
	view.form_data.default({
		alternative_nickname: `${import.meta.env.VITE_APP_NICKNAME}_`,
		channels: import.meta.env.VITE_APP_CHANNELS,
		nickname: import.meta.env.VITE_APP_NICKNAME,
		password_server: import.meta.env.VITE_APP_PASSWORD_SERVER,
		password_user: "",
		realname: import.meta.env.VITE_APP_REALNAME,
		remember_me: new RememberMeStorage(),
		websocket_server_url: import.meta.env.VITE_APP_WEBSOCKET_URL,
	});
});

watch(user_session, () => {
	if (user_session.value.is_none()) {
		view.form_data.set({
			realname: import.meta.env.VITE_APP_REALNAME,
		});
		return;
	}

	let user = user_session.value.unwrap();
	view.form_data.set({
		nickname: user.name,
		alternative_nickname: `${user.name}\``,
		realname: `#${user.id} - ${user.role} - (${user.email})`,
	});
});
</script>

<template>
	<main
		id="chat-login-view"
		class="[ scroll:y flex! flex/center:full m:a pos-r ]"
	>
		<section class="[ flex! gap=3 min-w=43 ]">
			<h1 class="[ f-size=24px ]">Accès direct au Chat</h1>

			<form
				id="chat-login-form"
				action="/chat/login"
				method="POST"
				class="[ ov:h flex! border/radius=1 ]"
				@submit="view.submit_form($event)"
			>
				<TextInput
					v-show="view.advanced_form"
					v-model="view.form_data.websocket_server_url"
					label="url"
					name="server"
					placeholder="URL WebSocket du serveur de Chat"
					type="url"
				/>

				<TextInput
					v-show="view.advanced_form"
					v-model="view.form_data.password_server"
					label="password"
					name="password_server"
					placeholder="Mot de passe du serveur de Chat"
					type="password"
				/>

				<TextInput
					v-model="view.form_data.nickname"
					label="user"
					name="nickname"
					:error="view.error.nickname"
					:maxlength="DirectAccessView.MAXLENGTH_NICKNAME"
					:placeholder="DirectAccessView.PLACEHOLDER_NICKNAME"
					:title="DirectAccessView.VALIDATION_NICKNAME_INFO"
				>
					<Match :maybe="user_session">
						<template #some="{ data: user }">
							<UiImage
								v-if="user.avatar"
								:id="user.id"
								:key="user.avatar"
								:src="user.avatar"
								:title="image_title_attribute"
								size="3"
								class="[ cursor:pointer ]"
								@click="view.update_account_handler()"
							/>
						</template>
						<template #none>
							<button
								v-if="!view.shown_password_user_field"
								type="button"
								class="[ flex flex/center:full gap=1 f-size=12px ]"
								title="Utiliser mon mot de passe (optionnel)"
								@click="view.display_password_user_field()"
							>
								<span>Mot de passe</span>
								<icon-password />
							</button>
						</template>
					</Match>
				</TextInput>

				<TextInput
					v-if="
						user_session.is_none() && view.shown_password_user_field
					"
					v-model="view.form_data.password_user"
					label="password"
					name="password_user"
					placeholder="Mot de passe du compte"
					type="password"
				/>

				<TextInput
					v-show="view.advanced_form"
					v-model="view.form_data.alternative_nickname"
					label="user"
					name="alternative_nickname"
					:error="view.error.alternative_nickname"
					placeholder="Pseudonyme alternatif"
					:maxlength="DirectAccessView.MAXLENGTH_NICKNAME"
					:title="DirectAccessView.VALIDATION_NICKNAME_INFO"
				/>

				<TextInput
					v-show="view.advanced_form"
					v-model="view.form_data.realname"
					label="user"
					name="realname"
					placeholder="Nom réel"
				/>

				<TextInput
					v-model="view.form_data.channels"
					label="channel"
					name="channels"
					placeholder="Salons à rejoindre (#chan1,#chan2)"
				/>
			</form>

			<div class="[ align-t:center ]" v-if="!view.advanced_form">
				<Button
					icon="plus"
					title="Afficher les champs avancés"
					@click="view.display_more_fields()"
				/>
			</div>

			<div class="remember-me [ m:a align-t:center f-size=14px w=35 ]">
				<label>
					Connexion automatique lors de tes prochaines sessions :
				</label>

				<InputSwitch
					v-model="view.form_data.remember_me.value"
					label-n="Non"
					label-y="Oui"
					name="remember_me"
				/>
			</div>

			<Button
				:icon="view.loader ? 'loader' : undefined"
				icon-position="right"
				type="submit"
				form="chat-login-form"
				class="[ flex align-jc:se p=2 b:none cursor:pointer ]"
			>
				<span class="[ flex:full ]">Accéder au Chat</span>
			</Button>
		</section>

		<Button
			icon="settings"
			class="settings-btn"
			@click="view.goto_settings_view_handler()"
		/>
	</main>
</template>

<style src="./DirectAccessView.style.scss" />

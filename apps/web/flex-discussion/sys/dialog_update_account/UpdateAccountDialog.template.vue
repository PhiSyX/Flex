<script setup lang="ts">
import { iso_to_country_flag } from "@phisyx/flex-helpers";
import { computed, ref } from "vue";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import ComboBox from "@phisyx/flex-uikit-vue/combobox/ComboBox.vue";
import Dialog from "@phisyx/flex-uikit-vue/dialog/Dialog.vue";
import FormLink from "@phisyx/flex-uikit-vue/form/FormLink.vue";

import Avatar from "#/api/avatar/Avatar.vue";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
	userId: UUID;
	username: string;
	firstname: string | null;
	lastname: string | null;
	country: string | null;
	gender: string | null;
	city: string | null;
	countriesList: Array<{ code: string; country: string }>;
}

interface Emits {
	(event_name: "close"): void;
	(event_name: "logout"): void;
	(event_name: "upload", file: File): void;
	(event_name: "submit", evt: Event): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let selected_country = ref(props.country || "");
let form = computed(() => `${props.layerName}_form`);

let flag_country = computed(() => iso_to_country_flag(selected_country.value));

let countries_list_combobox = computed(() =>
	props.countriesList.map((c) => ({
		label: c.country,
		value: c.code,
	}))
);

// ------- //
// Handler //
// ------- //

const close_dialog_handler = () => emit("close");
const logout_handler = () => {
	emit("logout");
	emit("close");
};
const upload_file_handler = (file: File) => emit("upload", file);
const submit_handler = (evt: Event) => emit("submit", evt);
</script>

<template>
	<Dialog @close="close_dialog_handler">
		<template #left-content>
			<div class="[ flex! py=2 ]">
				<div class="[ flex:full flex:shrink=0 mt=8 ]">
					<Avatar
						:form="form"
						:id="userId"
						vertical
						editable
						:size="14"
						name="avatar"
						@upload="upload_file_handler"
					/>
				</div>

				<FormLink
					class="logout"
					href="/auth/logout"
					method="DELETE"
					@success="logout_handler"
				>
					Se déconnecter
				</FormLink>
			</div>
		</template>

		<template #label> Modifier le profil de {{ username }} </template>

		<form method="post" :id="form" @submit.prevent="submit_handler">
			<fieldset class="[ flex gap=2 ]" name="name">
				<div class="[ flex! gap=1 ]">
					<label for="firstname">Prénom :</label>
					<input
						type="text"
						name="firstname"
						id="firstname"
						:value="firstname"
					/>
				</div>

				<div class="[ flex! gap=1 ]">
					<label for="lastname">Nom :</label>
					<input
						type="text"
						name="lastname"
						id="lastname"
						:value="lastname"
					/>
				</div>
			</fieldset>

			<fieldset class="[ flex gap=1 align-i:center ]" data-group="gender">
				<div class="[ flex! gap=1 ]">
					<label for="gender">Genre :</label>
					<input
						:value="gender"
						type="text"
						name="gender"
						list="gender-list"
						id="gender"
						placeholder="Homme,Femme,Autre..."
					/>
					<datalist id="gender-list">
						<option value="Homme">Homme</option>
						<option value="Femme">Femme</option>
					</datalist>
				</div>
			</fieldset>

			<fieldset class="[ flex gap=2 ]" data-group="country-city">
				<div class="[ flex! gap=1 ]">
					<label for="country">Pays : {{ flag_country }}</label>

					<ComboBox
						v-model="selected_country"
						:list="countries_list_combobox"
						name="country"
						placeholder="Filtrer les pays..."
					/>
				</div>

				<div class="[ flex! gap=1 ]">
					<label for="city">Ville :</label>
					<input :value="city" type="text" name="city" id="city" />
				</div>
			</fieldset>
		</form>

		<template #footer>
			<em class="[ f-size=12px ]">
				Les champs ayant un <strong>*</strong>asterisk sont
				obligatoires.
			</em>

			<Button
				:form="form"
				type="submit"
				variant="primary"
				class="[ ml=1 mt=1 ]"
			>
				OK
			</Button>

			<Button
				:form="form"
				type="reset"
				variant="secondary"
				class="[ ml=1 mt=1 ]"
				@click="close_dialog_handler"
			>
				Annuler
			</Button>
		</template>
	</Dialog>
</template>

<style lang="scss" scoped>
@use "@phisyx/flexsheets" as fx;

dialog {
	max-width: max-content !important;
}

fieldset {
	border-color: transparent;
}

.logout {
	border-radius: 4px;
	outline: 0;
}

em {
	vertical-align: text-bottom;
}

strong {
	color: var(--color-red500);
}

input[type="email"],
input[type="text"],
input[type="text"] {
	--default-placeholder-color: var(--color-grey900);
	// background: var(--color-ultra-white);
	// color: var(--color-black);
	border: 1px solid var(--default-border-color);
	border-radius: 4px;
	padding: 4px;
}

input[name="gender"][type="text"] {
	width: fx.space(150);
}

button[type="submit"] {
	--btn-primary-bg: var(--color-ultra-white);
	--btn-primary-bg-hover: var(--color-white);
	--btn-primary-color: var(--color-black);
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	&:hover {
		outline: 3px solid var(--dialog-border-color);
	}
}

button[type="reset"] {
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	&:hover {
		outline: 3px solid var(--dialog-border-color);
	}
}
</style>

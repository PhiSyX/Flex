<script setup lang="ts">
import { cast_to_channel_id } from "@phisyx/flex-chat/asserts/room";
import { ref } from "vue";

import Alert from "@phisyx/flex-uikit-vue/alert/Alert.vue";
import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import Dialog from "@phisyx/flex-uikit-vue/dialog/Dialog.vue";


// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
	names?: string;
	keys?: string;
	marksKeysFieldAsError?: boolean;
	withNotice?: boolean;
}

interface Emits {
	(event_name: "close"): void;
	(event_name: "submit", channels: ChannelID, keys: string): void;
}

// --------- //
// Composant //
// --------- //

const {
	names = "",
	keys = "",
	withNotice = true,
	marksKeysFieldAsError = false,
} = defineProps<Props>();
const emit = defineEmits<Emits>();

let channels_request = ref<ChannelID>(cast_to_channel_id(names));
let keys_request = ref(keys);

// ------- //
// Handler //
// ------- //

function create_channel_handler() {
	emit("submit", channels_request.value, keys_request.value);
}
</script>

<template>
	<Dialog @close="emit('close')">
		<template #label>Rejoindre un salon</template>

		<template #footer>
			<em class="[ f-size=12px ]">
				Les champs ayant un <strong>*</strong>asterisk sont
				obligatoires.
			</em>

			<Button
				type="submit"
				variant="primary"
				class="[ ml=1 mt=1 ]"
				:form="`${layerName}_form`"
				@click="create_channel_handler"
			>
				Rejoindre maintenant
			</Button>
		</template>

		<section class="[ flex! gap=1 ]">
			<Alert v-if="withNotice" type="warning" :closable="false">
				Tu es sur le point de rejoindre un salon OU de le créer.

				<br />
				<br />

				Si tu deviens chef de salon lors de la création du salon, tu es
				seul responsable des propos qui vont s'y tenir. En cas de
				dérapage, bannis immédiatement les utilisateurs en cause ou bien
				ferme ton salon.

				<br />

				Pour privatiser ton salon, protège-le par un mot de passe ! Il
				te suffira de le donner avec le nom du salon à tes contacts.
			</Alert>

			<Alert v-if="marksKeysFieldAsError" type="error" :closable="false">
				Une clé d'accès est requise pour pouvoir entrer sur ce salon (
				<em>{{ names }}</em>
				).
			</Alert>

			<form
				:id="`${layerName}_form`"
				action="/chat/join/channel"
				method="post"
				@submit.prevent="create_channel_handler"
			>
				<fieldset
					class="[ w:full flex flex/center:full gap=1 p=0 m=0 ]"
				>
					<p class="flex:shrink=0">
						<strong>* </strong>
						<label for="channels">Noms des salons:</label>
					</p>

					<input
						id="channels"
						v-model="channels_request"
						placeholder="#channel1,#channel2"
						required
						type="text"
						class="[ input:reset p=1 w:full ]"
					/>
				</fieldset>

				<fieldset
					class="[ w:full flex flex/center:full gap=1 p=0 m=0 ]"
					:class="{
						'is-error': marksKeysFieldAsError,
					}"
				>
					<p class="flex:shrink=0">
						<strong style="visibility: hidden">* </strong>
						<label for="keys">Clés d'accès: </label>
						<label style="visibility: hidden">abc"</label>
					</p>

					<input
						id="keys"
						v-model="keys_request"
						name="keys"
						placeholder="key1,key2"
						type="text"
						class="[ input:reset p=1 w:full ]"
					/>
				</fieldset>
			</form>
		</section>
	</Dialog>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

fieldset {
	border: 0;
}

input {
	--default-placeholder-color: var(--color-grey900);
	background: var(--color-ultra-white);
	color: var(--color-black);
	&:placeholder-shown {
		color: var(--default-placeholder-color);
	}
}

em {
	vertical-align: text-bottom;
}

.is-error,
strong {
	color: var(--color-red500);
}

.is-error {
	input {
		border: 1px dashed var(--color-red500);
	}
}

span {
	color: var(--color-grey500);
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
</style>

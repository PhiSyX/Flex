<script setup lang="ts">
import type { ChannelMember, ChannelRoom } from "@phisyx/flex-chat";

import { computed, ref, watch } from "vue";

import { Dialog, InputSwitchV2, UiButton } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props
{
	layerName: string;
	room: ChannelRoom;
	currentClientChannelMember: ChannelMember;
}

interface Emits
{
	(event_name: "close"): void;
	(event_name: "submit", modes_settings: Partial<Command<"MODE">["modes"]>): void;
	(event_name: "update-topic", topic?: string): void;
}

// ----------- //
// Énumération //
// ----------- //

enum AccessControl {
	BanList = 0,
	BanListException = 1,
	InviteList = 2,
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Est-ce que le client courant a les droits d'édition du sujet?
let is_current_client_channel_member_can_edit_topic = computed(
	() => props.room.can_edit_topic(props.currentClientChannelMember)
);

// Est-ce que le client courant est opérateur global?
let is_current_client_global_operator = computed(
	() => props.currentClientChannelMember.is_global_operator()
);

// Est-ce que le client courant opérateur du salon?
let is_current_client_channel_member_channel_operator = computed(
	() => props.currentClientChannelMember.is_channel_operator()
);

// Les paramètres du salon.
let settings = computed(() => Array.from(props.room.settings));
let settings_str = computed(() => settings.value.join(""));
let invite_only_settings = ref<boolean>();
let moderate_settings = ref<boolean>();
let operators_only_settings = ref<boolean>();
let no_external_messages_settings = ref<boolean>();
let secret_settings = ref<boolean>();
let topic_settings = ref<boolean>();

let enabled_key_settings = props.room.settings.has("k") ? ref(true) : ref();
let key_settings = props.room.settings.has("k") ? ref("") : ref();

// Appliquer un nouveau sujet de salon, par défaut le dernier dans l'historique.
let topic_model = ref(Array.from(props.room.topic.history).at(-1));

let selected_access_control_list = ref<Array<string>>([]);

let active_access_control = ref(AccessControl.BanList);
let active_access_control_list = computed(() => {
	switch (active_access_control.value) {
		case AccessControl.BanList:
			return props.room.access_control.banlist;
		case AccessControl.BanListException:
			return props.room.access_control.banlist_exception;
		case AccessControl.InviteList:
			return props.room.access_control.invitelist_exception;
	}
});

// Titre courant du type de contrôles d'accès
let active_title_access_control = computed(() => {
	switch (active_access_control.value) {
		case AccessControl.BanList:
			return "Liste des bannissements";
		case AccessControl.BanListException:
			return "Liste des exceptions de bannissements";
		case AccessControl.InviteList:
			return "Liste des exceptions d'invitations";
	}
});

// --------- //
// Lifecycle // -> Hooks
// --------- //

watch(active_access_control, () => {
	selected_access_control_list.value = [];
});

// ------- //
// Handler //
// ------- //

function submit_handler()
{
	if (is_current_client_channel_member_can_edit_topic.value) {
		emit("update-topic", topic_model.value);
	}

	if (
		!is_current_client_channel_member_channel_operator.value &&
		!is_current_client_global_operator.value
	) {
		emit("close");
		return;
	}

	emit("submit", {
		i: invite_only_settings.value,
		k: key_settings.value,
		m: moderate_settings.value,
		n: no_external_messages_settings.value,
		s: secret_settings.value,
		t: topic_settings.value,
		O: operators_only_settings.value,
	});
	emit("close");
}

function delete_selected_masks_handler()
{
	if (
		!is_current_client_channel_member_channel_operator.value &&
		!is_current_client_global_operator.value
	) {
		emit("close");
		return;
	}

	let list: "b" | "e" | "I";

	switch (active_access_control.value) {
		case AccessControl.BanList:
		{
			list = "b";
		} break;

		case AccessControl.BanListException:
		{
			list = "e";
		} break;

		case AccessControl.InviteList:
		{
			list = "I";
		} break;
	}

	emit("submit", {
		[list]: selected_access_control_list.value,
	});
}
</script>

<template>
	<Dialog :without-close="true">
		<template #label>
			Paramètres {{ room.name
			}}<span v-if="settings_str"
				>: (modes: +{{ settings_str }})</span
			>
		</template>

		<template #footer>
			<UiButton
				type="submit"
				variant="primary"
				class="[ ml=1 ]"
				:form="`${layerName}_form`"
			>
				Ok
			</UiButton>

			<UiButton
				type="button"
				formmethod="dialog"
				variant="secondary"
				class="[ ml=1 ]"
				:form="`${layerName}_form`"
				@click="emit('close')"
			>
				Annuler
			</UiButton>
		</template>

		<form
			:id="`${layerName}_form`"
			class="[ flex! gap=1 ]"
			method="dialog"
			@submit="submit_handler()"
		>
			<h2 class="[ mt=0 ]">Historique des sujets</h2>

			<input
				v-model="topic_model"
				list="topics"
				type="text"
				class="[ w:full ]"
				:disabled="!is_current_client_channel_member_can_edit_topic"
			/>
			<datalist id="topics">
				<option v-for="topic in room.topic.history" :value="topic" />
			</datalist>

			<section class="[ flex! gap=1 ]">
				<h2>{{ active_title_access_control }}</h2>

				<select
					multiple
					class="[ w:full min-h=10 max-w=44 ]"
					v-model="selected_access_control_list"
				>
					<option
						v-for="[addr, mode] of active_access_control_list"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
						:value="addr"
					>
						{{ addr }} par {{ mode.updated_by }} le
						{{ mode.updated_at }}
					</option>
				</select>

				<div class="[ flex gap=1 ]">
					<UiButton
						type="button"
						variant="secondary"
						v-model:selected="active_access_control"
						:value="AccessControl.BanList"
					>
						Bans (+b)
					</UiButton>

					<UiButton
						type="button"
						variant="secondary"
						v-model:selected="active_access_control"
						:value="AccessControl.BanListException"
					>
						Exceptions (+e)
					</UiButton>

					<UiButton
						type="button"
						variant="secondary"
						v-model:selected="active_access_control"
						:value="AccessControl.InviteList"
					>
						Invitations (+I)
					</UiButton>
				</div>

				<UiButton
					type="button"
					variant="secondary"
					:disabled="selected_access_control_list.length === 0"
					@click="delete_selected_masks_handler"
				>
					Supprimer
				</UiButton>
			</section>

			<h2>Paramètres du salon</h2>

			<ul class="[ list:reset flex! gap=2 px=1 ]">
				<li>
					<InputSwitchV2
						v-model="invite_only_settings"
						name="invite-only-settings"
						:checked="room.settings.has('i')"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
					>
						Salon accessible sur invitation uniquement (+i)
					</InputSwitchV2>
				</li>

				<li>
					<InputSwitchV2
						v-model="enabled_key_settings"
						name="key-settings"
						:checked="room.settings.has('k')"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
					>
						Définir une clé (+k)
					</InputSwitchV2>

					<input
						v-if="enabled_key_settings"
						v-model="key_settings"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
						maxlength="25"
						placeholder="Clé de salon"
						type="text"
						class="[ input:reset p=1 ]"
					/>
				</li>

				<li>
					<InputSwitchV2
						v-model="moderate_settings"
						name="moderate-settings"
						:checked="room.settings.has('m')"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
					>
						Salon en modéré (+m)
					</InputSwitchV2>
				</li>

				<li>
					<InputSwitchV2
						v-model="no_external_messages_settings"
						name="no-external-messages-settings"
						:checked="room.settings.has('n')"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
					>
						Pas de messages à partir de l'extérieur (+n)
					</InputSwitchV2>
				</li>

				<li>
					<InputSwitchV2
						v-model="secret_settings"
						name="secret-settings"
						:checked="room.settings.has('s')"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
					>
						Salon secret (+s)
					</InputSwitchV2>
				</li>

				<li>
					<InputSwitchV2
						v-model="topic_settings"
						name="topic-settings"
						:checked="room.settings.has('t')"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
					>
						Seuls les opérateurs peuvent définir un topic (+t)
					</InputSwitchV2>
				</li>

				<li v-if="is_current_client_global_operator">
					<InputSwitchV2
						v-model="operators_only_settings"
						name="operators-only-settings"
						:checked="room.settings.has('O')"
						:disabled="
							!is_current_client_channel_member_channel_operator &&
							!is_current_client_global_operator
						"
					>
						Salon accessible uniquement pour les opérateurs (+O)
					</InputSwitchV2>
				</li>
			</ul>
		</form>
	</Dialog>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

dialog {
	// @media (max-height: 515px) {
	// 	height: 100%;
	// }
}

h1,
h2 {
	font: inherit;
	font-weight: 700;
}

li {
	display: flex;
	gap: fx.space(1);
	align-items: center;
}

select,
input {
	--default-placeholder-color: var(--color-grey900);
	background: var(--color-ultra-white);
	color: var(--color-black);
	&:placeholder-shown {
		color: var(--default-placeholder-color);
	}
	&:disabled {
		opacity: 0.5;
		pointer-events: none;
	}
}

button[type="button"] {
	--btn-secondary-color: var(--color-black);
	
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	
	&:hover {
		outline: 3px solid var(--dialog-border-color);
	}

	@include fx.scheme using($name) {
		@if $name == dark {
			--btn-secondary-bg: var(--color-grey400);
		} @else {
			--btn-secondary-bg: var(--color-blue-grey200);
		}
	}
}

@include fx.class("btn(:active)") {
	--btn-secondary-bg: var(--color-ultra-white) !important;
	// background-color: red;
}

button[type="submit"] {
	--btn-primary-bg: var(--color-ultra-white);
	--btn-primary-color: var(--color-black);
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	&:hover {
		outline: 3px solid var(--dialog-border-color);
	}
}
</style>

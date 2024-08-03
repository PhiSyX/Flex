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
	(event_name: "submit", modesSettings: Partial<Command<"MODE">["modes"]>): void;
	(event_name: "update-topic", topic?: string): void;
}

// ----------- //
// Énumération //
// ----------- //

enum AccessControl {
	BanList = 0,
	BanListException = 1,
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Est-ce que le client courant a les droits d'édition du sujet?
let is_current_client_channel_member_can_edit_topic = computed(
	() => props.room.canEditTopic(props.currentClientChannelMember)
);

// Est-ce que le client courant est opérateur global?
let is_current_client_global_operator = computed(
	() => props.currentClientChannelMember.isGlobalOperator()
);

// Est-ce que le client courant opérateur du salon?
let is_current_client_channel_member_channel_operator = computed(
	() => props.currentClientChannelMember.isChanOperator()
);

// Les paramètres du salon.
let settings = computed(() => Array.from(props.room.settings));
let settingsToString = computed(() => settings.value.join(""));
let inviteOnlySettings = ref<boolean>();
let moderateSettings = ref<boolean>();
let operatorsOnlySettings = ref<boolean>();
let noExternalMessagesSettings = ref<boolean>();
let secretSettings = ref<boolean>();
let topicSettings = ref<boolean>();

let enabledKeySettings = props.room.settings.has("k") ? ref(true) : ref();
let keySettings = props.room.settings.has("k") ? ref("") : ref();

// Appliquer un nouveau sujet de salon, par défaut le dernier dans l'historique.
let topicModel = ref(Array.from(props.room.topic.history).at(-1));

let selectedAccessControlList = ref<Array<string>>([]);

let activeAccessControl = ref(AccessControl.BanList);
let activeAccessControlList = computed(() => {
	switch (activeAccessControl.value) {
		case AccessControl.BanList:
			return props.room.accessControl.banlist;
		case AccessControl.BanListException:
			return props.room.accessControl.banlistException;
	}
});

// Titre courant du type de contrôles d'accès
let activeTitleAccessControl = computed(() => {
	switch (activeAccessControl.value) {
		case AccessControl.BanList:
			return "Liste des bannissements";
		case AccessControl.BanListException:
			return "Liste des exceptions de bannissements";
	}
});

// --------- //
// Lifecycle // -> Hooks
// --------- //

watch(activeAccessControl, () => {
	selectedAccessControlList.value = [];
});

// ------- //
// Handler //
// ------- //

function submit_handler() 
{
	if (is_current_client_channel_member_can_edit_topic.value) {
		emit("update-topic", topicModel.value);
	}

	if (
		!is_current_client_channel_member_channel_operator.value &&
		!is_current_client_global_operator.value
	) {
		emit("close");
		return;
	}

	emit("submit", {
		i: inviteOnlySettings.value,
		k: keySettings.value,
		m: moderateSettings.value,
		n: noExternalMessagesSettings.value,
		s: secretSettings.value,
		t: topicSettings.value,
		O: operatorsOnlySettings.value,
	});
	emit("close");
}

function delete_selected_masks_handler() {
	if (
		!is_current_client_channel_member_channel_operator.value &&
		!is_current_client_global_operator.value
	) {
		emit("close");
		return;
	}

	let list: "b" | "e";

	switch (activeAccessControl.value) {
		case AccessControl.BanList:
		{
			list = "b";
		} break;

		case AccessControl.BanListException:
		{
			list = "e";
		} break;
	}

	emit("submit", {
		[list]: selectedAccessControlList.value,
	});
}
</script>

<template>
	<Dialog :without-close="true">
		<template #label>
			Paramètres {{ room.name
			}}<span v-if="settingsToString"
				>: (modes: +{{ settingsToString }})</span
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
				v-model="topicModel"
				list="topics"
				type="text"
				class="[ w:full ]"
				:disabled="!is_current_client_channel_member_can_edit_topic"
			/>
			<datalist id="topics">
				<option v-for="topic in room.topic.history" :value="topic" />
			</datalist>

			<h2>{{ activeTitleAccessControl }}</h2>

			<select
				multiple
				class="[ w:full min-h=10 max-w=44 ]"
				v-model="selectedAccessControlList"
			>
				<option
					v-for="[addr, mode] of activeAccessControlList"
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
					v-model:selected="activeAccessControl"
					:value="AccessControl.BanList"
				>
					Bans
				</UiButton>

				<UiButton
					type="button"
					variant="secondary"
					v-model:selected="activeAccessControl"
					:value="AccessControl.BanListException"
				>
					Bans Excepts
				</UiButton>

				<UiButton
					type="button"
					variant="secondary"
					:disabled="selectedAccessControlList.length === 0"
					@click="delete_selected_masks_handler"
				>
					Supprimer
				</UiButton>
			</div>

			<h2>Paramètres du salon</h2>

			<ul class="[ list:reset flex! gap=2 px=1 ]">
				<li>
					<InputSwitchV2
						v-model="inviteOnlySettings"
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
						v-model="enabledKeySettings"
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
						v-if="enabledKeySettings"
						v-model="keySettings"
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
						v-model="moderateSettings"
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
						v-model="noExternalMessagesSettings"
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
						v-model="secretSettings"
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
						v-model="topicSettings"
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
						v-model="operatorsOnlySettings"
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

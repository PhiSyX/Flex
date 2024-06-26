<script setup lang="ts">
import { Dialog, InputSwitchV2, UiButton } from "@phisyx/flex-uikit";
import { computed, ref, watch } from "vue";

import type { ChannelMember } from "~/channel/member";
import type { ChannelRoom } from "~/channel/room";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
	room: ChannelRoom;
	currentClientChannelMember: ChannelMember;
}

interface Emits {
	(evtName: "close"): void;
	(evtName: "submit", modesSettings: Partial<Command<"MODE">["modes"]>): void;
	(evtName: "update-topic", topic?: string): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Est-ce que le client courant a les droits d'édition du sujet?
const isCurrentClientChannelMemberCanEditTopic = computed(() =>
	props.room.canEditTopic(props.currentClientChannelMember),
);

// Est-ce que le client courant est opérateur global?
const isCurrentClientGlobalOperator = computed(() =>
	props.currentClientChannelMember.isGlobalOperator(),
);

// Est-ce que le client courant opérateur du salon?
const isCurrentClientChannelMemberChannelOperator = computed(() =>
	props.currentClientChannelMember.isChanOperator(),
);

// Les paramètres du salon.
const settings = computed(() => Array.from(props.room.settings));
const settingsToString = computed(() => settings.value.join(""));
const inviteOnlySettings = ref<boolean>();
const moderateSettings = ref<boolean>();
const operatorsOnlySettings = ref<boolean>();
const noExternalMessagesSettings = ref<boolean>();
const secretSettings = ref<boolean>();
const topicSettings = ref<boolean>();

const enabledKeySettings = props.room.settings.has("k") ? ref(true) : ref();
const keySettings = props.room.settings.has("k") ? ref("") : ref();

// Appliquer un nouveau sujet de salon, par défaut le dernier dans l'historique.
const topicModel = ref(Array.from(props.room.topic.history).at(-1));

enum AccessControl {
	BanList = 0,
	BanListException = 1,
}

const selectedAccessControlList = ref<Array<string>>([]);

const activeAccessControl = ref(AccessControl.BanList);
const activeAccessControlList = computed(() => {
	switch (activeAccessControl.value) {
		case AccessControl.BanList:
			return props.room.accessControl.banlist;
		case AccessControl.BanListException:
			return props.room.accessControl.banlistException;
	}
});

// Titre courant du type de contrôles d'accès
const activeTitleAccessControl = computed(() => {
	switch (activeAccessControl.value) {
		case AccessControl.BanList:
			return "Liste des bannissements";
		case AccessControl.BanListException:
			return "Liste des exceptions de bannissements";
	}
});

watch(activeAccessControl, () => {
	selectedAccessControlList.value = [];
});

function onSubmitHandler() {
	if (isCurrentClientChannelMemberCanEditTopic.value) {
		emit("update-topic", topicModel.value);
	}

	if (
		!isCurrentClientChannelMemberChannelOperator.value &&
		!isCurrentClientGlobalOperator.value
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

function onDeleteSelectedMasksHandler() {
	if (
		!isCurrentClientChannelMemberChannelOperator.value &&
		!isCurrentClientGlobalOperator.value
	) {
		emit("close");
		return;
	}

	let list: "b" | "e";

	switch (activeAccessControl.value) {
		case AccessControl.BanList:
			{
				list = "b";
			}
			break;
		case AccessControl.BanListException:
			{
				list = "e";
			}
			break;
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
			@submit="onSubmitHandler()"
		>
			<h2 class="[ mt=0 ]">Historique des sujets</h2>

			<input
				v-model="topicModel"
				list="topics"
				type="text"
				class="[ w:full ]"
				:disabled="!isCurrentClientChannelMemberCanEditTopic"
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
						!isCurrentClientChannelMemberChannelOperator &&
						!isCurrentClientGlobalOperator
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
					@click="onDeleteSelectedMasksHandler"
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
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
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
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
						"
					>
						Définir une clé (+k)
					</InputSwitchV2>

					<input
						v-if="enabledKeySettings"
						v-model="keySettings"
						:disabled="
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
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
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
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
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
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
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
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
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
						"
					>
						Seuls les opérateurs peuvent définir un topic (+t)
					</InputSwitchV2>
				</li>

				<li v-if="isCurrentClientGlobalOperator">
					<InputSwitchV2
						v-model="operatorsOnlySettings"
						name="operators-only-settings"
						:checked="room.settings.has('O')"
						:disabled="
							!isCurrentClientChannelMemberChannelOperator &&
							!isCurrentClientGlobalOperator
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
	@include fx.scheme using($name) {
		@if $name == dark {
			--btn-secondary-bg: var(--color-grey400);
		} @else {
			--btn-secondary-bg: var(--color-blue-grey200);
		}
	}
	--btn-secondary-color: var(--color-black);
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	&:hover {
		outline: 3px solid var(--dialog-border-color);
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

<script setup lang="ts">
import { UiButton, Dialog, InputSwitchV2 } from "@phisyx/flex-uikit";

import { computed, ref } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
	canEditTopic: boolean;
	channel: string;
	isChannelOperator: boolean;
	isGlobalOperator: boolean;
	settings: Array<string>;
	topics: Set<string>;
}

interface Emits {
	(evtName: "close"): void;
	(evtName: "submit", modesSettings: Command<"MODE">["modes"]): void;
	(evtName: "update-topic", topic?: string): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const settings = computed(() => props.settings.join(""));

const hasKeySettings = computed(() => props.settings.includes("k"));
const hasModerateSettings = computed(() => props.settings.includes("m"));
const hasNoExternalMessagesSettings = computed(() =>
	props.settings.includes("n")
);
const hasOperatorsOnlySettings = computed(() => props.settings.includes("O"));
const hasSecretSettings = computed(() => props.settings.includes("s"));
const hasTopicSettings = computed(() => props.settings.includes("t"));

const moderateSettings = ref();
const operatorsOnlySettings = ref();
const noExternalMessagesSettings = ref();
const secretSettings = ref();
const topicSettings = ref();
const topicModel = ref(Array.from(props.topics).at(-1));

const enabledKeySettings = ref();
const keySettings = ref();

function closeHandler() {
	emit("close");
}

function submitHandler() {
	if (props.canEditTopic) {
		emit("update-topic", topicModel.value);
	}

	if (!props.isChannelOperator && !props.isGlobalOperator) {
		emit("close");
		return;
	}

	emit("submit", {
		k: keySettings.value,
		m: moderateSettings.value,
		n: noExternalMessagesSettings.value,
		s: secretSettings.value,
		t: topicSettings.value,
		O: operatorsOnlySettings.value,
	});
}
</script>

<template>
	<Dialog :without-close="true">
		<template #label>
			Paramètres {{ channel
			}}<span v-if="settings">: (modes: +{{ settings }})</span>
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
				@click="closeHandler()"
			>
				Annuler
			</UiButton>
		</template>

		<form
			:id="`${layerName}_form`"
			method="dialog"
			@submit="submitHandler()"
		>
			<h2 class="[ mt=0 ]">Historique des sujets</h2>

			<input
				v-model="topicModel"
				list="topics"
				type="text"
				class="[ w:full ]"
				:disabled="!canEditTopic"
			/>
			<datalist id="topics">
				<option v-for="topic in topics" :value="topic" />
			</datalist>

			<h2>Paramètres du salon</h2>

			<ul class="[ list:reset flex! gap=2 px=1 ]">
				<li>
					<InputSwitchV2
						v-model="enabledKeySettings"
						name="key-settings"
						:checked="hasKeySettings"
						:disabled="!isChannelOperator && !isGlobalOperator"
					>
						Définir une clé (+k)
					</InputSwitchV2>

					<input
						v-if="enabledKeySettings"
						v-model="keySettings"
						:disabled="!isChannelOperator && !isGlobalOperator"
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
						:checked="hasModerateSettings"
						:disabled="!isChannelOperator && !isGlobalOperator"
					>
						Salon en modéré (+m)
					</InputSwitchV2>
				</li>

				<li>
					<InputSwitchV2
						v-model="noExternalMessagesSettings"
						name="no-external-messages-settings"
						:checked="hasNoExternalMessagesSettings"
						:disabled="!isChannelOperator && !isGlobalOperator"
					>
						Pas de messages à partir de l'extérieur (+n)
					</InputSwitchV2>
				</li>

				<li>
					<InputSwitchV2
						v-model="secretSettings"
						name="secret-settings"
						:checked="hasSecretSettings"
						:disabled="!isChannelOperator && !isGlobalOperator"
					>
						Salon secret (+s)
					</InputSwitchV2>
				</li>

				<li>
					<InputSwitchV2
						v-model="topicSettings"
						name="topic-settings"
						:checked="hasTopicSettings"
						:disabled="!isChannelOperator && !isGlobalOperator"
					>
						Seuls les opérateurs peuvent définir un topic (+t)
					</InputSwitchV2>
				</li>

				<li v-if="isGlobalOperator">
					<InputSwitchV2
						v-model="operatorsOnlySettings"
						name="operators-only-settings"
						:checked="hasOperatorsOnlySettings"
						:disabled="!isChannelOperator && !isGlobalOperator"
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
	--btn-secondary-bg: var(--color-blue-grey200);
	--btn-secondary-color: var(--color-black);
	padding: fx.space(1) fx.space(2);
	border-radius: 2px;
	&:hover {
		outline: 3px solid var(--dialog-border-color);
	}
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

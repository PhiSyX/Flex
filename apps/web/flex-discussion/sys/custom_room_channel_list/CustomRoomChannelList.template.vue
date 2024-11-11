<script setup lang="ts">
import { computed, ref } from "vue";

import { fuzzy_search } from "@phisyx/flex-search/fuzzy_search";

import Button from "@phisyx/flex-uikit-vue/button/Button.vue";
import DataGrid from "@phisyx/flex-uikit-vue/datagrid/DataGrid.vue";

// ---- //
// Type //
// ---- //

interface Props {
	servername: string;
	channels: Array<GenericReply<"RPL_LIST">>;
}

interface Emits {
	(event_name: "join-channel", name: ChannelID): void;
	(event_name: "create-channel-dialog", event: MouseEvent): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let filtered_channel_input = ref("");
let selected_channels = ref(new Set<ChannelID>());

let filtered_channels = computed(() => {
	if (filtered_channel_input.value.length === 0) {
		return props.channels;
	}
	return props.channels.filter((data) =>
		fuzzy_search(filtered_channel_input.value, data.channel).is_some()
	);
});

// -------- //
// Handlers //
// -------- //

function join_selected_channels() {
	for (let channel of selected_channels.value) {
		join_channel_handler(channel);
	}

	selected_channels.value.clear();
}

const join_channel_handler = (name: ChannelID) => emit("join-channel", name);
const create_channel_dialog_handler = (event: MouseEvent) =>
	emit("create-channel-dialog", event);
</script>

<template>
	<div class="channel/list [ flex! gap=2 p=1 mx:a ]">
		<h1 class="[ align-t:center ]">
			Liste des salons du serveur {{ servername }}
		</h1>

		<input
			v-model.trim="filtered_channel_input"
			placeholder="Filtrer ces salons..."
			type="search"
			class="[ input:reset p=1 border/radius=1 ]"
		/>

		<div class="[ flex gap=1 align-jc:end ]">
			<Button
				id="channel-join-layer_btn"
				class="[ px=2 py=1 border/radius=0.6 ]"
				appearance="primary"
				@click="create_channel_dialog_handler"
			>
				Créer un salon
			</Button>

			<Button
				class="[ px=2 py=1 border/radius=0.6 ]"
				appearance="primary"
				:disabled="selected_channels.size === 0"
				@click="join_selected_channels"
			>
				Rejoindre les salons sélectionnés
			</Button>
		</div>

		<DataGrid
			:caption="
				filtered_channels.length === 0 ? 'Il n\'y a aucun salon' : null
			"
			:titles="{
				channel: 'Nom du salon',
				modes_settings: 'Paramètres',
				topic: 'Sujet du salon',
				total_members: 'Utilisateurs',
			}"
			:list="filtered_channels"
			:can-select="true"
			selected-key="channel"
			v-model:selected-items="selected_channels"
			class="channel/list:datagrid"
			@itemclick="() => {}"
			@itemdblclick="(item) => join_channel_handler(item.channel)"
		>
		</DataGrid>
	</div>
</template>

<style scoped lang="scss">
@use "@phisyx/flexsheets" as fx;

@include fx.class("channel/list") {
	max-width: 80ch;

	@include fx.scheme using($name) {
		@if $name == ice {
			--btn-primary-bg: var(--color-blue-grey700);
			--btn-primary-bg-hover: var(--color-blue-grey800);
		} @else if $name == dark {
			--btn-primary-bg: var(--color-grey900);
			--btn-primary-bg-hover: var(--color-ultra-black);
		} @else if $name == light {
			--btn-primary-color: var(--color-white);
			--btn-primary-bg: var(--color-grey800);
			--btn-primary-bg-hover: var(--color-grey900);
		}
	}
}

input {
	background: var(--channel-list-filter-input-bg);
}
</style>

<style lang="scss">
@use "@phisyx/flexsheets" as fx;

@include fx.class("channel/list:datagrid") {
	tbody td[data-key="channel"] {
		overflow: auto;
		display: block;
		max-width: 75px;
	}

	tbody td[data-key="topic"] {
		overflow: auto;
		position: relative;
		display: block;
		max-width: 25vw;
	}
}
</style>

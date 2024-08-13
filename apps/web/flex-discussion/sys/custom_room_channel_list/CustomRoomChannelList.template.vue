<script setup lang="ts">
import { computed, ref } from "vue";

import { fuzzy_search } from "@phisyx/flex-search";
import { UiButton } from "@phisyx/flex-vue-uikit";

// ---- //
// Type //
// ---- //

interface Props
{
	channels: Array<GenericReply<"RPL_LIST">>,
}

interface Emits
{
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

	return props.channels.filter((channel) =>
		fuzzy_search(filtered_channel_input.value, channel.channel).is_some(),
	);
});

// -------- //
// Handlers //
// -------- //

function join_selected_channels()
{
	for (let channel of selected_channels.value) {
		join_channel_handler(channel);
	}

	selected_channels.value.clear();
}

const join_channel_handler = (name: ChannelID) 	=> emit("join-channel", name);
const create_channel_dialog_handler = (event: MouseEvent) 	=> emit("create-channel-dialog", event);
</script>

<template>
	<div class="channel/list [ flex! gap=2 p=1 ]">
		<h1 class="[ align-t:center ]">Liste des salons</h1>

		<input
			v-model.trim="filtered_channel_input"
			placeholder="Filtrer ces salons..."
			type="search"
			class="[ input:reset p=1 border/radius=1 ]"
		/>

		<div class="[ flex gap=1 align-jc:end ]">
			<UiButton
				id="channel-join-layer_btn"
				class="[ px=2 py=1 border/radius=0.6 ]"
				variant="primary"
				@click="create_channel_dialog_handler"
			>
				Créer un salon
			</UiButton>

			<UiButton
				class="[ px=2 py=1 border/radius=0.6 ]"
				variant="primary"
				:disabled="selected_channels.size === 0"
				@click="join_selected_channels"
			>
				Rejoindre les salons sélectionnés
			</UiButton>
		</div>

		<div class="table [ ov:h border/radius=1 scroll:y ]">
			<div class="thead thead:bg pos-s">
				<div><input type="checkbox" disabled /></div>
				<div>Nom du salon</div>
				<div>Paramètres</div>
				<div>Sujet du salon</div>
				<div>Utilisateurs</div>
			</div>

			<div
				class="tbody"
				v-for="(channel_data, idx) of filtered_channels"
			>
				<span>#</span>
				<span>Nom du salon</span>
				<span>Paramètres</span>
				<span>Sujet du salon</span>
				<span>Utilisateurs</span>

				<div>
					<label
						:for="`chan-${idx}`"
						@dblclick="join_channel_handler(channel_data.channel)"
					/>
					<input
						:id="`chan-${idx}`"
						type="checkbox"
						v-model="selected_channels"
						:value="channel_data.channel"
					/>
				</div>
				<div>{{ channel_data.channel }}</div>
				<div>+{{ channel_data.modes_settings }}</div>
				<div class="channel/list:topic">{{ channel_data.topic }}</div>
				<div>{{ channel_data.total_members }}</div>
			</div>

			<div class="tbody" v-if="channels.length === 0">
				<p>Il n'y a aucun salon</p>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("channel/list") {
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

.tbody,
.thead {
	display: grid;
	grid-template-columns:
		fx.space(3) fx.space(150) fx.space(100)
		1fr fx.space(100);

	gap: 0 fx.space(1);

	padding: fx.space(1);

	transition: background 200ms;

	> span {
		visibility: hidden;
		height: 0;
	}
}

.thead {
	padding: fx.space(2) fx.space(1);
	font-variant: small-caps;
}

@include fx.class("thead:bg") {
	background: var(--thead-bg);
}

.tbody {
	position: relative;

	background: var(--tbody-bg);
	color: var(--color-black);

	&:hover {
		background: var(--tbody-bg-hover);
	}

	> div {
		overflow-y: auto;
		max-height: fx.space(5);
	}

	label {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		cursor: pointer;
	}

	p {
		grid-column: 1 / end;
		text-align: center;
		font-size: 14px;
		color: var(--color-grey600);
	}
}

@include fx.class("channel/list:topic") {
	z-index: 1;
}
</style>

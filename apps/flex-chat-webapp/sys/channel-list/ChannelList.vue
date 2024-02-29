<script setup lang="ts">
import { UiButton } from "@phisyx/flex-uikit";
import { fuzzy_search } from "@phisyx/flex-search";
import { ref, computed } from "vue";

import { ChannelListCustomRoom } from "~/custom-room/ChannelListCustomRoom";

// ---- //
// Type //
// ---- //

interface Props {
	room: ChannelListCustomRoom;
}

interface Emits {
	(evtName: "join-channel", name: ChannelID): void;
	(evtName: "create-channel-dialog", event: MouseEvent): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const filteredChannelInput = ref("");
const selectedChannels = ref(new Set<ChannelID>());

const filteredChannels = computed(() => {
	if (filteredChannelInput.value.length === 0) {
		return props.room.channels;
	}
	return Array.from(props.room.channels).filter((channel) =>
		fuzzy_search(filteredChannelInput.value, channel[0]).is_some()
	);
});

// -------- //
// Handlers //
// -------- //

function joinSelectedChannels() {
	for (const channel of selectedChannels.value) {
		joinChannel(channel);
	}
	selectedChannels.value.clear();
}

function joinChannel(name: ChannelID) {
	emit("join-channel", name);
}

function createChannelDialog(event: MouseEvent) {
	emit("create-channel-dialog", event);
}
</script>

<template>
	<div class="channel/list [ flex! gap=2 p=1 ]">
		<h1 class="[ align-t:center ]">Liste des salons</h1>

		<input
			v-model.trim="filteredChannelInput"
			placeholder="Filtrer ces salons..."
			type="search"
			class="[ input:reset p=1 border/radius=1 ]"
		/>

		<div class="[ flex gap=1 align-jc:end ]">
			<UiButton
				id="channel-join-layer_btn"
				class="[ px=2 py=1 border/radius=0.6 ]"
				variant="primary"
				@click="createChannelDialog"
			>
				Créer un salon
			</UiButton>

			<UiButton
				class="[ px=2 py=1 border/radius=0.6 ]"
				variant="primary"
				:disabled="selectedChannels.size === 0"
				@click="joinSelectedChannels()"
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
				v-for="([_, channelData], idx) of filteredChannels"
			>
				<span>#</span>
				<span>Nom du salon</span>
				<span>Paramètres</span>
				<span>Sujet du salon</span>
				<span>Utilisateurs</span>

				<div>
					<label
						:for="`chan-${idx}`"
						@dblclick="joinChannel(channelData.channel)"
					/>
					<input
						:id="`chan-${idx}`"
						type="checkbox"
						v-model="selectedChannels"
						:value="channelData.channel"
					/>
				</div>
				<div>{{ channelData.channel }}</div>
				<div>+{{ channelData.modes_settings }}</div>
				<div class="channel/list:topic">{{ channelData.topic }}</div>
				<div>{{ channelData.total_members }}</div>
			</div>

			<div class="tbody" v-if="room.channels.size === 0">
				<p>Il n'y a aucun salon</p>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("channel/list") {
	@include fx.theme using($name) {
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

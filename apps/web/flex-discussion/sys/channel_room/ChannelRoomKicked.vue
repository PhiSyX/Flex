<script setup lang="ts">
import type { RoomMessage } from "@phisyx/flex-chat";

import { computed, ref, toRaw } from "vue";

// ---- //
// Type //
// ---- //

interface Props
{
	lastMessage: RoomMessage;
}

interface Emits
{
	// NOTE: cette règle n'est pas concevable pour le cas présent.
	// biome-ignore lint/style/useShorthandFunctionType: Lire NOTE ci-haut.
	(event_name: "join-channel", channel_name: string): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let display_join_button = ref(true);

// NOTE: Nous voulons récupérer le dernier événement du salon juste avant le
//       KICK, car il contient les données du KICK, mais pas les nouveaux
//       événements/messages qui pourraient être ajoutés. De nouveaux événements
//       peuvent être ajoutés au salon au fur & à mesure que le salon en état de
//       KICK mais actif. Exemple, Lorsqu'un utilisateur entre en contact avec
//       l'utilisateur qui a été KICK, l'événement "QUERY" est ajouté à la
//       chambre active.
let to_raw_last_message = toRaw(
	props.lastMessage as RoomMessage & { data: GenericReply<"KICK"> },
);

let nickname = computed(() => to_raw_last_message.data.origin.nickname);
let channel = computed(() => to_raw_last_message.data.channel);
let reason = computed(() => to_raw_last_message.data.reason);

// ------- //
// Handler //
// ------- //

const join_channel_handler = () => emit("join-channel", to_raw_last_message.data.channel);
</script>

<template>
	<div class="channel/kicked [ flex:full flex! flex/center:full px=3 ]">
		<p>
			Vous avez été sanctionné par
			<strong>{{ nickname }}</strong>
			du salon {{ channel }} pour la raison suivante «
			<strong>{{ reason }}</strong> » !
		</p>

		<button
			v-if="display_join_button"
			class="[ p=1 cursor:pointer ]"
			@click="join_channel_handler"
		>
			Rejoindre le salon
		</button>
	</div>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

@include fx.class("channel/kicked") {
	background: var(--room-kicked-bg);
}

p {
	color: var(--color-red400);
	font-variant: small-caps;
}

button {
	border-radius: 4px;

	background: var(--room-kicked-button-bg);
	color: var(--room-kicked-button-color);
}
</style>

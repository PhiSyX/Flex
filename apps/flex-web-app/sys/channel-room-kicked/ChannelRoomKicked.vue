<script setup lang="ts">
import { ref, toRaw, computed } from "vue";

import { RoomMessage } from "~/room/RoomMessage";

// ---- //
// Type //
// ---- //

interface Props {
	lastMessage: RoomMessage;
}

interface Emits {
	(evtName: "join-channel", channelName: string): void;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const displayJoinButton = ref(true);

// NOTE: Nous voulons récupérer le dernier événement du salon juste avant le
//       KICK, car il contient les données du KICK, mais pas les nouveaux
//       événements/messages qui pourraient être ajoutés. De nouveaux événements
//       peuvent être ajoutés au salon au fur & à mesure que le salon en état de
//       KICK mais actif. Exemple, Lorsqu'un utilisateur entre en contact avec
//       l'utilisateur qui a été KICK, l'événement "QUERY" est ajouté à la
//       chambre active.
const toRawLastMessage = toRaw(
	props.lastMessage as RoomMessage & { data: GenericReply<"KICK"> }
);

const nickname = computed(() => toRawLastMessage.data.origin.nickname);
const channel = computed(() => toRawLastMessage.data.channel);
const reason = computed(() => toRawLastMessage.data.reason);

function joinChannelHandler() {
	emit("join-channel", toRawLastMessage.data.channel);
}
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
			v-if="displayJoinButton"
			class="[ p=1 cursor:pointer ]"
			@click="joinChannelHandler()"
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

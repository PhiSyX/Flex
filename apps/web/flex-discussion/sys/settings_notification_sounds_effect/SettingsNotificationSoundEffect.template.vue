<script lang="ts" setup>
import { ref } from "vue";

import { vModelSelect } from "@phisyx/flex-vue-directives";
import { AudioSound } from "@phisyx/flex-vue-uikit";

import connection_audio from "#/assets/audio/connection.mp3";
import invite_audio from "#/assets/audio/invite.mp3";
import mention_audio from "#/assets/audio/mention.mp3";
import notice_audio from "#/assets/audio/notice.mp3";
import query_audio from "#/assets/audio/query.wav";

// ---- //
// Type //
// ---- //

interface Props {
	disabled?: boolean;
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();

let sounds = defineModel<Record<string, boolean>>("sounds", { required: true });

let audio = ref({
	connection: {
		src: connection_audio,
		playing: false,
	},
	invite: {
		src: invite_audio,
		playing: false,
	},
	mention: {
		src: mention_audio,
		playing: false,
	},
	notice: {
		src: notice_audio,
		playing: false,
	},
	query: {
		src: query_audio,
		playing: false,
	},
});
</script>

<template>
	<div class="[ flex gap=1 w:full select:none ]">
		<ul class="[ list:reset py=1 ]">
			<li v-for="item of audio" @click="item.playing = true">
				<icon-sound />

				<AudioSound
					:src="item.src"
					:autoplay="item.playing"
					@ended="item.playing = false"
				/>
			</li>
		</ul>

		<select
			multiple v-model-select="sounds" :disabled="disabled"
			class="[ p=1 ]"
		>
			<option value="connection">Lors de la connexion</option>
			<option value="invites">Lorsqu'on m'invite sur un salon</option>
			<option value="mentions">Lorsqu'on mentionne mon pseudo</option>
			<option value="notices">Lorsqu'une notice m'est destinée</option>
			<option value="queries">Lorsqu'un utilisateur me contacte pour la 1ère fois en privé</option>
		</select>
	</div>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

select {
	border: 0;
	border-radius: 4px;
}

select option {
	padding-block: 4px;
}

select[disabled] option:checked {
	background-color: var(--disabled-color);
	cursor: not-allowed;
}
</style>

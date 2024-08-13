<script setup lang="ts">
import { computed } from "vue";

import { AudioSound } from "@phisyx/flex-vue-uikit";

import { use_chat_store } from "~/store";

import ClientError from "~/components/error/ClientError.vue";
import Navigation from "~/components/navigation/Navigation.vue";

import ChangeFormatsColorsDialog from "~/components/dialog/ChangeFormatsColorsDialog.vue";
import ChangeNickDialog from "~/components/dialog/ChangeNickDialog.vue";
import ChannelCreateDialog from "~/components/dialog/ChannelCreateDialog.vue";
import ChannelSettingsDialog from "~/components/dialog/ChannelSettingsDialog.vue";

import connection_audio from "#/assets/audio/connection.mp3";
import invite_audio from "#/assets/audio/invite.mp3";
import mention_audio from "#/assets/audio/mention.mp3";
import notice_audio from "#/assets/audio/notice.mp3";
import query_audio from "#/assets/audio/query.wav";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();

let audio_src = computed({
	get() {
		return chat_store.store.audio_src;
	},
	set($1) {
		chat_store.store.audio_src = $1;
	}
});

function reset_audio_src()
{
	audio_src.value = null;
}
</script>

<template>
    <main id="chat-view" class="[ flex h:full ]">
		<Navigation />

        <RouterView />

		<AudioSound :src="connection_audio" :autoplay="audio_src === 'connection'" @ended="reset_audio_src" />
		<AudioSound :src="invite_audio" :autoplay="audio_src === 'invite'" @ended="reset_audio_src" />
		<AudioSound :src="mention_audio" :autoplay="audio_src === 'mention'" @ended="reset_audio_src" />
		<AudioSound :src="notice_audio" :autoplay="audio_src === 'notice'" @ended="reset_audio_src" />
		<AudioSound :src="query_audio" :autoplay="audio_src === 'query'" @ended="reset_audio_src" />

		<!-- Teleport -->

		<ClientError />

		<ChangeFormatsColorsDialog />
		<ChangeNickDialog />
		<ChannelCreateDialog />
		<ChannelSettingsDialog />
	</main>
</template>

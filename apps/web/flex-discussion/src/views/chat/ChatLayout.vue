<script setup lang="ts">
import { computed } from "vue";
import { useRoute as use_route } from "vue-router";

import { AudioSound } from "@phisyx/flex-vue-uikit";

import { use_chat_store, use_settings_store } from "~/store";

import ClientError from "~/components/error/ClientError.vue";
import Navigation from "~/components/navigation/Navigation.vue";

import ChangeFormatsColorsDialog from "~/components/dialog/ChangeFormatsColorsDialog.vue";
import ChangeNickDialog from "~/components/dialog/ChangeNickDialog.vue";
import ChannelJoinDialog from "~/components/dialog/ChannelJoinDialog.vue";
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
let settings_store = use_settings_store();

let audio_src = computed({
	get() {
		return chat_store.store.audio_src;
	},
	set($1) {
		chat_store.store.audio_src = $1;
	}
});

let route = use_route();

// ------- //
// Handler //
// ------- //

function reset_audio_src()
{
	audio_src.value = null;
}
</script>

<template>
    <main id="chat-view" class="[ flex h:full ]">
		<Navigation />

		<RouterView v-slot="{ Component }">
			<KeepAlive>
				<component :is="Component" :key="route.fullPath" />
			</KeepAlive>
		</RouterView>

		<template v-if="settings_store.notification.sounds.enabled">
			<AudioSound 
				v-if="settings_store.notification.sounds.connection"
				:src="connection_audio"
				:autoplay="audio_src === 'connection'"
				@ended="reset_audio_src" 
			/>
			<AudioSound 
				v-if="settings_store.notification.sounds.invites"
				:src="invite_audio"
				:autoplay="audio_src === 'invite'"
				@ended="reset_audio_src" 
			/>
			<AudioSound 
				v-if="settings_store.notification.sounds.mentions"
				:src="mention_audio"
				:autoplay="audio_src === 'mention'"
				@ended="reset_audio_src" 
			/>
			<AudioSound 
				v-if="settings_store.notification.sounds.notices"
				:src="notice_audio"
				:autoplay="audio_src === 'notice'"
				@ended="reset_audio_src" 
			/>
			<AudioSound 
				v-if="settings_store.notification.sounds.queries"
				:src="query_audio"
				:autoplay="audio_src === 'query'"
				@ended="reset_audio_src" 
			/>
		</template>

		<!-- Teleport -->

		<ClientError />

		<ChangeFormatsColorsDialog />
		<ChangeNickDialog />
		<ChannelJoinDialog />
		<ChannelSettingsDialog />
	</main>
</template>

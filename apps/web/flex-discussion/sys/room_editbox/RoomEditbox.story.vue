<script setup lang="ts">
import { PrivateRoom } from "@phisyx/flex-chat/private/room";

import RoomEditbox from "./RoomEditbox.template.vue";

let room = new PrivateRoom("PhiSyX");
</script>

<template>
	<Story title="Molecules/RoomEditbox" responsive-disabled>
		<Variant title="Default">
			<RoomEditbox
				current-client-nickname="PhiSyX"
				:disable-input="false"
				placeholder="Placeholder"
				:room="room"
			/>
		</Variant>

		<Variant title="Disabled">
			<RoomEditbox
				current-client-nickname="PhiSyX"
				:disable-input="true"
				placeholder="Placeholder"
				:room="room"
			/>
		</Variant>
	</Story>
</template>

<style>
#app [data-v-app],
.histoire-generic-render-story {
	height: 100%;
	color: var(--default-text-color);
}
</style>

<script setup lang="ts">
import RoomEditbox from "./RoomEditbox.vue";
</script>

<template>
	<Story title="Molecules/RoomEditbox" responsive-disabled>
		<Variant title="Default">
			<RoomEditbox
				:disable-input="false"
				placeholder="Placeholder"
				target="#channel"
			/>
		</Variant>

		<Variant title="Disabled">
			<RoomEditbox
				:disable-input="true"
				placeholder="Placeholder"
				target="#channel"
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

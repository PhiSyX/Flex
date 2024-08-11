<script lang="ts" setup>
import ChannelCreateDialog from "./ChannelCreateDialog.template.vue";
</script>

<template>
	<Story title="Molecules/Dialog/ChannelCreateDialog" responsive-disabled>
		<Variant title="Default">
			<ChannelCreateDialog layer-name="layer" />
		</Variant>
	</Story>
</template>

<style>
#app [data-v-app] {
	width: 100vw;
	height: 100vh;
}
#app [data-v-app] > div {
	width: 100%;
	height: 100%;
	display: flex;
	place-items: center;
}
#app [data-v-app] > div > dialog {
	position: relative;
	margin: auto;
}
</style>

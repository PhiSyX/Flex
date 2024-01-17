<script setup lang="ts">
import Navigation from "~/components/navigation/Navigation.vue";
</script>

<template>
	<main id="chat-view">
		<Navigation />
	</main>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

main {
	display: flex;

	height: 100%;
}
</style>

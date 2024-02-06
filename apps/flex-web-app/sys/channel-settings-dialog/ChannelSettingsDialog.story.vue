<script lang="ts" setup>
import ChannelSettingsDialog from "./ChannelSettingsDialog.vue";
</script>

<template>
	<Story title="Molecules/ChannelSettingsDialog" responsive-disabled>
		<Variant title="Désactivé">
			<ChannelSettingsDialog
				layer-name="layer"
				channel="#chan"
				:is-channel-operator="false"
				:is-global-operator="false"
				:settings="['s', 'm']"
			/>
		</Variant>

		<Variant title="État d'opérateur de salon ou d'opérateur global">
			<ChannelSettingsDialog
				layer-name="layer"
				channel="#chan"
				:is-channel-operator="true"
				:is-global-operator="true"
				:settings="['n', 't']"
			/>
		</Variant>
	</Story>
</template>

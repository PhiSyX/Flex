<script lang="ts" setup>
import ChannelSettingsDialog from "./ChannelSettingsDialog.vue";
</script>

<template>
	<Story title="Molecules/ChannelSettingsDialog" responsive-disabled>
		<Variant title="Désactivé">
			<ChannelSettingsDialog
				layer-name="layer"
				channel="#chan"
				:can-edit-topic="false"
				:is-channel-operator="false"
				:is-global-operator="false"
				:topics="new Set()"
				:settings="['s', 'm']"
			/>
		</Variant>

		<Variant title="État d'opérateur de salon ou d'opérateur global">
			<ChannelSettingsDialog
				layer-name="layer"
				channel="#chan"
				:can-edit-topic="true"
				:is-channel-operator="true"
				:is-global-operator="true"
				:settings="['n', 't']"
				:topics="new Set()"
			/>
		</Variant>
	</Story>
</template>

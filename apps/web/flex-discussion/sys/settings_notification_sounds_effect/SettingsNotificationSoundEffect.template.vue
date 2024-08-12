<script lang="ts" setup>
import { vModelSelect } from '~/directives';

interface Props
{
}

// --------- //
// Composant //
// --------- //

defineProps<Props>();

let sounds = defineModel<Record<string, boolean>>("sounds", { required: true });
</script>

<template>
	<div class="[ flex gap=3 w:full select:none ]">
		<select multiple v-model-select="sounds" class="[ p=1 ]">
			<option value="connection">Lors de la connexion</option>
			<option value="invites">Lorsqu'on m'invite sur un salon</option>
			<option value="mentions">Lorsqu'on mentionne mon pseudo</option>
			<option value="notices">Lorsqu'une notice m'est destinée</option>
			<option value="queries">Lorsqu'un privé s'ouvre pour la 1ère fois</option>
		</select>
	</div>
</template>

<style lang="scss" scoped>
@use "scss:~/flexsheets" as fx;

select
{
	border: 0;
	border-radius: 4px;
}
</style>

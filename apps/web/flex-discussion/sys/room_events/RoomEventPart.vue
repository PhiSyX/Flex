<script setup lang="ts">
import { type Props, computeHostname } from "./RoomEvent.state";

// --------- //
// Composant //
// --------- //

defineOptions({ inheritAttrs: false });
const { data } = defineProps<Props<"PART">>();

const hostname = computeHostname(data.origin);
</script>

<template>
	<time :datetime="time.datetime">
		{{ time.formatted_time }}
	</time>
	<p>
		* Parts: <bdo>{{ data.origin.nickname }}</bdo> (<bdo>{{
			data.origin.ident
		}}</bdo
		>@<span>{{ hostname }}</span
		>)
		<em v-if="data.message">
			(<q>{{ data.message }}</q>
			<em v-if="data.forced_by">
				(Par <bdo>{{ data.forced_by }}</bdo
				>)</em
			>)
		</em>
	</p>
</template>

<style scoped lang="scss">
@use "@phisyx/flexsheets" as fx;

p {
	color: var(--color-grey500);
}

bdo,
span {
	color: var(--default-text-color);
}
</style>

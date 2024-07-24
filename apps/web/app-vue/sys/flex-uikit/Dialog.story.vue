<script lang="ts" setup>
import { Dialog } from "@phisyx/flex-vue-uikit";
</script>

<template>
	<Story title="Molecules/Dialog/Skeleton" responsive-disabled>
		<Variant title="Default">
			<Dialog>
				<template #label>Label</template>

				<template #footer>Footer</template>

				Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
				laudantium sed odit ab aperiam fuga quo, asperiores, ut quia
				incidunt voluptates at maiores minus, magni illum voluptatibus
				inventore neque quasi?
			</Dialog>
		</Variant>
	</Story>
</template>

<script setup lang="ts">
import type { DropDownListEmits } from "@phisyx/flex-uikit/dropdown/emits";
import type {
	DropDownListItem,
	DropDownListProps,
} from "@phisyx/flex-uikit/dropdown/props";

// --------- //
// Composant //
// --------- //

const { list } = defineProps<DropDownListProps>();
const emit = defineEmits<DropDownListEmits>();

let position_model = defineModel<number>("position", { required: true });

function select(selected_item: DropDownListItem) {
	position_model.value = -1;
	emit("select", selected_item);
}

function updated($1: { el: HTMLLIElement }, idx: number) {
	if (position_model.value !== idx) {
		return;
	}

	$1.el.scrollIntoView({
		behavior: "instant",
		block: "nearest",
	});
}
</script>

<template>
	<div class="fx:dropdown-list [ ov:c ]">
		<div class="fx:dropdown-list/container [ ov:y ]">
			<ul class="[ list:reset flex! ov:h h:full ]">
				<li v-if="!list.length">Aucun élément trouvé</li>

				<li
					v-for="(item, idx) of list"
					:key="item.value"
					:tabindex="idx + 1"
					:class="{
						'is-hover': position_model === idx,
						'is-selected': item.selected,
					}"
					class="[ cursor:pointer flex gap=2 align-jc:sb ]"
					@click="select(item)"
					@vue:updated="($1: any) => updated($1, idx)"
				>
					<span v-if="item.label.length > 0">{{ item.label }}</span>
					<em v-else>vide</em>

					<em v-if="item.selected" class="[ flex:shrink=0 ]">
						(sélectionné)
					</em>
				</li>
			</ul>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "@phisyx/flex-uikit-stylesheets/dropdown/DropDownList.scss";
</style>

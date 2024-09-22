<script setup lang="ts">
// ---- //
// Type //
// ---- //

interface Props {
	id: string;
	list: Array<{
		value: string;
		label: string;
		position: number;
		selected: boolean;
	}>;
}

interface Emits {
	// biome-ignore lint/style/useShorthandFunctionType: tkt
	(event_name: "select", item: Props["list"][number]): void;
}

// --------- //
// Composant //
// --------- //

const { list } = defineProps<Props>();
const emit = defineEmits<Emits>();
let position_model = defineModel<number>("position");

function select(selected_item: Props["list"][number]) {
	position_model.value = -1;
	emit("select", selected_item);
}

function updated($1: any, idx: number) {
	if (position_model.value !== idx) {
		return;
	}

	($1.el as HTMLLIElement).scrollIntoView({
		behavior: "instant",
		block: "nearest",
	});
}
</script>

<template>
	<div class="dropdown-list [ ov:c ]">
		<div class="dropdown-list/container [ ov:y ]">
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
@use "scss:~/flexsheets" as fx;

.dropdown-list {
	background-color: Canvas;
	color: CanvasText;
	border: 1px inset ButtonBorder;
	border-radius: 4px;
	padding-block: 4px;
}

@include fx.class("dropdown-list/container") {
	width: 100%;
	min-width: fx.space(210);
	max-width: fx.space(338);
	max-height: fx.space(210);
	padding: 4px;
}

ul {
	gap: 2px;
}

li {
	padding: 4px;
	border-radius: 4px;
	word-wrap: break-word;
}

.is-hover,
li:hover {
	background-color: AccentColor;
	color: AccentColorText;
	em {
		color: SelectedItem;
	}
}

.is-selected {
	background-color: SelectedItem;
	color: SelectedItemText;
	em {
		color: AccentColor;
	}
}
</style>

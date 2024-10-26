<script lang="ts" setup generic="T extends Record<PropertyKey, unknown>">
import type { DataGridProps } from "@phisyx/flex-uikit/datagrid/props";
import type { DataGridEmits } from "@phisyx/flex-uikit/datagrid/emits";

import { computed, useId } from "vue";

const {
	caption,
	canSelect = false,
	titles,
	list,
} = defineProps<DataGridProps<T>>();
const emits = defineEmits<DataGridEmits<T>>();
const selected_items = defineModel("selected-items");

const unique_id = useId();

const fields = computed(() => {
	let thead_titles = Object.keys(titles);

	return list.map((item) => {
		let temp: Partial<T> = {};

		for (let [title, val] of Object.entries(item)) {
			if (thead_titles.includes(title)) {
				// @ts-expect-error T
				temp[title] = val;
			}
		}

		return temp;
	});
});

const click_handler = (item: T) => emits("itemclick", item);
const dblclick_handler = (item: T) => emits("itemdblclick", item);
</script>

<template>
	<div class="fx:datagrid [ ov:h border/radius=1 ]">
		<div class="fx:datagrid/scroll [ scroll:y ]">
			<table>
				<caption v-if="caption">
					{{
						caption
					}}
				</caption>

				<thead>
					<tr>
						<th v-if="canSelect" class="align-t:center">
							<input type="checkbox" disabled />
						</th>

						<th
							v-for="(title, title_name) of titles"
							:data-key="title_name"
						>
							{{ title }}
						</th>
					</tr>
				</thead>

				<tbody>
					<tr
						v-for="(item, idx) of fields"
						@click="click_handler(list[idx])"
						@dblclick="dblclick_handler(list[idx])"
					>
						<td v-if="canSelect">
							<label :for="`fx-datagrid-${unique_id}-${idx}`" />
							<input
								:id="`fx-datagrid-${unique_id}-${idx}`"
								type="checkbox"
								v-model="selected_items"
								:value="item[selectedKey]"
							/>
						</td>

						<td
							v-for="(_, key) of titles"
							:data-key="key"
							class="..."
						>
							{{ item[key] }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use "@phisyx/flex-uikit-stylesheets/datagrid/DataGrid.scss";
</style>

<script lang="ts" setup>
import { ButtonIcon, ICON_NAMES, LabelIcon } from "@phisyx/flex-vue-uikit";
</script>

<template>
    <Story title="Atoms/Icons" :layout="{ type: 'grid' }" responsive-disabled>
        <Variant title="Button">
            <div class="flex flex:wrap gap=1">
                <ButtonIcon 
                    v-for="name of ICON_NAMES" 
                    :key="name" 
                    :icon="name" 
                    :title="name" 
                />
            </div>
        </Variant>

        <Variant title="Label">
            <div class="flex flex:wrap gap=1">
                <LabelIcon
                    v-for="name of ICON_NAMES"
                    :key="name"
                    :icon="name" :for="name" 
                    :title="name" 
                />
            </div>
        </Variant>
    </Story>
</template>

<template>
	<span class="badge [ di-b align-t:center border/radius=3 ]"><slot /></span>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

span {
	padding: calc(#{fx.space(1)} / 2) fx.space(1);
}
</style>

<template>
	<span class="badge"><slot /></span>
</template>

<style scoped lang="scss">
@use "scss:~/flexsheets" as fx;

span {
	display: inline-block;
	padding: calc(#{fx.space(1)} / 2) fx.space(1);
	text-align: center;
	border-radius: fx.space(3);
}
</style>

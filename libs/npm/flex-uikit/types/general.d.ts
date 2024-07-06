// biome-ignore lint/suspicious/noExplicitAny: ;-)
type FIXME = any;

declare type FlagExcludedType<B, T> = {
	[Key in keyof B]: B[Key] extends T ? never : Key;
};
declare type AllowedNames<B, T> = FlagExcludedType<B, T>[keyof B];
declare type OmitType<B, T> = Pick<B, AllowedNames<B, T>>;
declare type Attributes<T extends abstract new (...args: FIXME) => FIXME> =
	OmitType<
		InstanceType<T>,
		// biome-ignore lint/complexity/noBannedTypes: ;-)
		Function
	>;

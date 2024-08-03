# Type

## Convention

La convention de nommage choisie pour le nom d'un type est `PascalCase`.

## `T[]` vs `Array<T>`

Préférer utiliser `Array<T>`.

## Exemple

```rs
type Foo<'a> = ...;
type FooBar<'a> = ...;

trait Toto 
{
	type Tata;
	type Titi: Tutu;
}
```

```ts
type Foo<T> = ...;
type FooBar<T> = ...;
```

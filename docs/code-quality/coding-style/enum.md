# Énumération

La convention de nommage choisie pour le nom d'une énumération est `PascalCase`.

La convention de nommage choisie pour le nom d'un variant d'une énumération est `PascalCase` ou `SCREAMING_SNAKE_CASE`,
mais pas les deux en même temps pour une seule énumération.

## Exemple correct

```rs
enum Foo 
{
	Bar,
	FooBar,
	FooFooBar,
}

enum Bar 
{
	BAR,
	FOO_BAR,
	FOO_FOO_BAR,
}
```

## Exemple incorrect

```rs
enum Foo 
{
	Bar,
	FooBar,
	FOO_BAR,
}
```

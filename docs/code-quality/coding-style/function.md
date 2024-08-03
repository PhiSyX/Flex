# Fonction / Méthode

La convention de nommage choisie pour le nom d'un générique est `PascalCase`.

La convention de nommage choisie pour le nom d'une fonction ou de méthode est `snake_case`.

La convention de nommage choisie pour un nom de paramètre est la même que celle choisie pour les
[variables](./variable.md) (`snake_case`).

Les 

## Exemple Rust

```rs
fn my_function<T>(value: T) 
{
	...
}

struct MyImpl<T> { value: T, };

impl<T> MyImpl<T> 
{
	fn get_value(&self) -> T { ... }
	fn set_value(&mut self, new_value: T) { ... }
}
```

## Exemple TypeScript

```ts
function my_function<T>(value: T) 
{
	...
}

class MyClass<T> 
{
	value!: T;

	get_value(): T { ... }
	set_value(new_value: T) { ... }
}
```

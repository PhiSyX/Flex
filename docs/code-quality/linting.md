# Linting

Les linters sont utilisés pour aider à appliquer le style de codage et éviter les mauvaises pratiques.

## Pour ce projet

-   [clippy](https://doc.rust-lang.org/clippy/): il s'agit de l'outil pour l'analyse statique de Rust.
-   [Rustfmt](https://github.com/rust-lang/rustfmt): il s'agit de l'outil pour le style de codage Rust.
-   [Biome](https://biomejs.dev/guides/getting-started/): il s'agit d'un outil pour l'analyse statique et le style de
    codage JavaScript et/ou TypeScript.

## Comment les utiliser

À partir du gestionnaire de paquet `cargo` et `pnpm`.

-   `cargo clippy`
-   `cargo fmt`
-   `pnpm fmt`: cette commande lance la commande `biome format` pour chaque paquet présent dans `packages/npm`.
-   `pnpm lint`: cette commande lance la commande `biome lint` pour chaque paquet présent dans `packages/npm`.

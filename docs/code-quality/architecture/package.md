# Paquet de module

Un paquet de module est un _répertoire_ contenant un fichier d'un dès gestionnaires de paquets, comme `Cargo` ou `npm`,
placé dans le répertoire en question.

Le nom d'un paquet de module DOIT être nommé en `kebab-case`. Ce nom est _généralement_ défini dans le fichier d'un dès
gestionnaires de paquets.

## Exemple

```bash
┌───(PhiSyX@フィジックス)
├── λ ls
|   └── libs/cargo/my-crate/
|       └── Cargo.toml
└── λ cat my-crate/Cargo.toml
```

```toml
[package]
name = "my-crate"
```

```bash
┌───(PhiSyX@フィジックス)
├── λ ls
|   └── libs/npm/my-module/
|       └── package.json
└── λ cat my-module/package.json
```

```json
{ "name": "flex-my-module" }
```

```json
{ "name": "@flex/my-module" }
```

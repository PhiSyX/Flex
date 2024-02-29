# Flex

**Flex** est un projet qui n'a pas d'objectif spécifique, il vise à développer des applications et des sites web de
manière différente, en utilisant une multitude de langages et une variété de technologies.

**Flex** a été réfléchi pour une architecture / organisation multi-applications et multi-sites.

---

Informations importantes concernant ce projet:

1.  Il a été crée pour le **fun** et dans le but de m'améliorer dans la conception de projets de manière générale.
2.  Il n'a pas vocation d'être **DÉPLOYÉ** pour de la production.
3.  Il n'est pas **STABLE** et ne le sera pas non plus dans le futur.
4.  Il ne se veut pas lié à un écosystème d'un langage précis.
5.  Il PEUT être **abandonné** à tout moment.

Autrement dit, c'est un code en chantier et _non professionnel_. Toutefois le projet se veut suivre une certaine qualité
de code, en suivant les [règles de qualité de code](docs/code-quality/) qui ont été définit par mes propres soins.

---

## Applications de **Flex**:

-   [x] [**Chat**](docs/chat/README.md)

    -   [x] Client Web (`pnpm webapp`)

		1. Un fichier `apps/flex-chat-webapp/.env` DOIT être crée.

    -   [x] Serveur (`cargo run --bin flex-ws-server`)

		1. Un fichier `config/flex/.env` DOIT être crée.

		2. Un fichier `config/flex/flex.yml` DOIT être crée.

    -   [ ] Services (robots, automates, IA)

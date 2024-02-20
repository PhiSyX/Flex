# Application de Chat

## Features

-   [x] Module AWAY

    -   [x] Marquer l'utilisateur comme étant absent avec la commande /away
    -   [x] Marquer l'utilisateur comme n'étant plus absent avec la commande /back
    -   [ ] Notifier les utilisateurs avec les capacités serveur (`away-notify`).

-   [x] Module INVITE

    -   [x] Inviter un utilisateur sur un salon avec la commande /invite

-   [x] Module JOIN

    -   [x] Rejoindre un salon avec la commande /join
    -   [x] Force un utilisateur à rejoindre un salon /sajoin (requiert drapeau utilisateur `o`)

-   [x] Module KICK

    -   [x] Sanctionner un membre d'un salon avec /kick (requiert au minimum le niveau d'accès `h`)

-   [x] Module KILL

    -   [x] Sanctionner un utilisateur via la commande /kill (requiert drapeau utilisateur `o` ou `O`)

-   [x] Module LIST

    -   [x] Liste les salons via la commande /list

        -   [ ] Possibilité de filtrer directement en argument.

    -   [x] Salon invisible depuis /list via un paramètre de salon `s` (salon
            secret)

-   [ ] Module MODE

    -   [x] Drapeaux utilisateurs

        -   [x] Marque l'utilisateur comme étant absent `a`
        -   [x] Marque l'utilisateur comme étant opérateur global `o`
        -   [x] Marque l'utilisateur comme étant opérateur local `O`
        -   [ ] Cache les salons de l'utilisateur dans une commande /WHOIS `p`
        -   [x] Marque l'opérateur global `o` comme étant non sanctionable d'un KICK sur les salons `q`

    -   [x] Paramètres de salon

        -   [x] Salon accessible via une clé `k`

        -   [x] Salon accessible sur invitation `i`

        -   [x] Salon modéré `m`

            -   Requiert un niveau d'accès `v` (ou +) pour pouvoir écrire sur le salon

        -   [x] Bloquer les messages des utilisateurs externes au salon `n`

        -   [x] Salon accessible pour les opérateurs globaux et locaux uniquement `O`

        -   [x] Salon secret `s`

        -   [x] Changement du sujet pour les opérateurs de salons uniquement `t`

    -   [x] Niveaux d'accès d'un salon

        -   [x] Drapeaux `qaohv`
            -   [x] Owner `q`
            -   [x] Admin `a`
            -   [x] Operator `o`
            -   [x] Half-Operator `h`
            -   [x] VIP `v`
        -   [ ] Commande /mode `qaohv`
        -   [x] Commande /qop | /deqop
        -   [x] Commande /aop | /deaop
        -   [x] Commande /op | /deop
        -   [x] Commande /hop | /dehop
        -   [x] Commande /vip | /devip

    -   [ ] Contrôles d'accès d'un salon

        -   [ ] Liste des bannissements `b`
        -   [ ] Liste des exceptions de bans `e`
        -   [ ] Liste des exception d'invite `I`
        -   [ ] Commande /mode `beI`
        -   [ ] Commande /ban | /unban

-   [x] Module NICK

    -   [x] Changement de pseudo via la commande /nick

    -   [ ] Force un utilisateur à changer son pseudo via la commande /chgnick (requiert d'avoir le drapeau utilisateur `o` ou `O`)

-   [x] Module NOTICE

    -   [x] Commande /notice

-   [ ] Module **S**Notice Serveur

-   [x] Module OPER

    -   [x] Marque l'utilisateur comme étant un opérateur global ou local via la commande /oper

-   [x] Module PART

    -   [x] Partir d'un salon avec la commande /part
    -   [x] Forcer un membre de salon à quitter le salon via la commande /sapart

-   [x] Module PASS

-   [x] Module PRIVMSG

    -   [x] Envoyer un message privé avec la commande /privmsg

-   [x] Module PUBMSG

    -   [x] Envoyer un message sur un salon avec la commande /pubmsg

-   [x] Module QUIT

-   [x] Module SILENCE

    -   [x] (Ne plus) Ignorer un utilisateur via la commande /silence

-   [x] Module TOPIC

    -   [x] Appliquer un nouveau sujet de salon via la commande /topic

-   [x] Module USER

-   [ ] Module WHOIS

    -   [ ] En savoir davantage sur un utilisateur avec la commande /whois

    -   [ ] Salon invisible depuis drapeau utilisateur `p` (salon privé)

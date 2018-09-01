# 🧙‍♀️ simple_mtg 🧙‍♂️
> simple magic the gathering online

![UI](https://github.com/sinemetu1/simple_mtg/blob/screenshots/ss.png?raw=true "UI")

## What is simple_mtg?

It's a ui for playing mtg with your friends online in combination with Facetime
or something similar.

_It is not produced, endorsed, supported, or affiliated with Wizards of the
Coast in any way. Card data served on the site is Copyright © Wizards of the
Coast \- All Rights Reserved_

Rules are meant to be followed by the players and not enforced by this app.

All code is [Apache 2.0 licensed][lic].

## Why?

[MTG online][mtgo] is Windows only. :( Also, simple_mtg is meant to be a
lightweight ui that works on mobile and desktop.

## TODO

- caching of game state using local storage
- fuzzy search
- token card search
- other stuff probably

## Notes

simple_mtg is deployed on [Heroku][hku] and [Github Pages][ghp]. It uses [web
sockets][sockets] and the [magicthegathering.io api][mtgio].

\*\*\* Please note that no data is stored by simple_mtg. Session and chat room
data is transient. Messages are **_not_** currently encrypted.

If you like this thing and find it useful, go buy some cards or maybe [help
some people who need it][gw]!

[lic]: https://github.com/sinemetu1/simple_mtg/blob/master/LICENSE
[mtgo]: https://magic.wizards.com/en/content/magic-online-products-game-info
[hku]: https://heroku.com
[ghp]: https://pages.github.com
[sockets]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
[mtgio]: https://magicthegathering.io/#donate
[gw]: https://www.givewell.org/charities/top-charities

[![Dependency Status](https://www.versioneye.com/user/projects/56dd2251309a580038b000de/badge.svg?style=flat)](https://www.versioneye.com/user/projects/56dd2251309a580038b000de)
[![DOI](https://zenodo.org/badge/46412901.svg)](https://zenodo.org/badge/latestdoi/46412901)

# UiO Library Subject Search

Frontend for subject search against the vocabularies
Realfagstermer (Bokmål, Nynorsk, English) and Humord (Bokmål).

The frontend uses a [Skosmos](https://github.com/NatLibFi/Skosmos) instance to query for subjects, and the Primo Search API through [LSM](https://github.com/scriptotek/lsm) to query for catalogue records.

## Develop

After cloning the repository, run `npm install`
to fetch dependencies.
To make a development build in the `build` folder and start a
development server, run `npm run dev`.
To make a production build, run `npm run build`.

## Translation

The application is translated [on Transifex](https://www.transifex.com/university-of-oslo-library/subject-search/),
and the translation workflow is supported by
[angular-gettext](https://github.com/rubenv/angular-gettext),
[angular-gettext-cli](https://github.com/huston007/angular-gettext-cli) and
[transifex-api-es6](https://github.com/alexanderwallin/transifex-api-es6).

* After source strings have been added or modified, run `npm run update-pot` to
  extract translatable strings from the application into the PO template file
  `po/emnesok.pot` and push it to Transifex. For this to work, your Transifex
  credentials must be stored in the `.env` file.

* `npm run compile-po` fetches the latest translations from Transifex into the
  `po` folder and compiles these into `src/app/services/translations.json`.

* `npm run trans` combines the two commands above for a full sync.

## Code style

This project tries to adher to:

* [Y033](https://github.com/johnpapa/angular-styleguide#style-y033): Controllers: Place bindable members at the top of the controller, alphabetized
* [Y052](https://github.com/johnpapa/angular-styleguide#style-y052): Factories: Expose the callable members of the service (its interface) at the top (Revealing Module Pattern)

## .htaccess

Atm. we have two `.htaccess` files, one in `htdocs`:

```
RewriteEngine on
RewriteBase /ub/emnesok/

# Serve data from some folders directly

RewriteCond %{REQUEST_URI} ^/ub/emnesok/(data|legacy|program|skosmos)
RewriteRule ^.+$ - [NC,L]

# Redirect from old URLs

RewriteCond "%{QUERY_STRING}" "^id=UHS$"
RewriteRule "^.*$" "humord?" [R,L]

RewriteCond "%{QUERY_STRING}" "^id=UREAL$"
RewriteRule "^.*$" "realfagstermer?" [R,L]

RewriteCond "%{QUERY_STRING}" "^id=TEK$"
RewriteRule "^.*$" "tekord?" [R,L]

RewriteCond "%{QUERY_STRING}" "^id=MR$"
RewriteRule "^.*$" "mrtermer?" [R,L]

RewriteRule "^test/oria/(.*)$" "$1" [R,L]

# Alias / to /2/build/

RewriteRule ^(.*) 2/build/$1 [NC,L]
```

and one in `/htdocs/2/`

```
RewriteEngine on
RewriteBase /ub/emnesok/2/

RewriteCond %{REQUEST_FILENAME} -s [OR]
RewriteCond %{REQUEST_FILENAME} -l [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^.*$ - [NC,L]

RewriteRule ^(.*) build/index.html [NC,L]
```

TODO: Simplify and merge into one file.

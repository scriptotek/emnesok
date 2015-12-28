# UiO Library Subject Search

Frontend for subject search against the vocabularies
Realfagstermer (Bokmål, Nynorsk, English), Humord (Bokmål), Tekord (Bokmål) and Menneskerettighetstermer (English).

The frontend uses a [Skosmos](https://github.com/NatLibFi/Skosmos) instance to query for subjects, and the Primo Search API through [LSM](https://github.com/scriptotek/lsm) to query for catalogue records.

## Develop

After cloning the repository, run `npm install` to fetch dependencies.
To make a development build in the `build` folder and start a
development server, run `gulp serve`.
To make a production build, run `gulp build --env=prod`.
For a list of available Gulp tasks, run `gulp help`.

## Translation

The application is translated [on Transifex](https://www.transifex.com/university-of-oslo-library/subject-search/), supported by [angular-gettext](https://github.com/rubenv/angular-gettext)
and [angular-gulp-gettext](https://github.com/gabegorelick/gulp-angular-gettext).

* Run `gulp pot` to extract translatable strings from
  the application into the PO template file `po/emnesok.pot`.
  Transifex will read the file from GitHub.

* Translate on Transifex and download the translations as
  PO files into the `po` folder. (TODO: Add Gulp task to
  fetch translations automatically)

* Run `gulp translations` to compile `build/js/translations.js`
  from the PO files in the `po` folder. (Note: the task will also
  be carried out by `gulp build`)

## Code style

This project tries to adher to:

* [Y033](https://github.com/johnpapa/angular-styleguide#style-y033): Controllers: Place bindable members at the top of the controller, alphabetized
* [Y052](https://github.com/johnpapa/angular-styleguide#style-y052): Factories: Expose the callable members of the service (its interface) at the top (Revealing Module Pattern)

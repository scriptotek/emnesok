# UiO Library Subject Search

Frontend for subject search against the vocabularies
Realfagstermer (Bokmål, Nynorsk, English), Humord (Bokmål), Tekord (Bokmål) and Menneskerettighetstermer (English).

To setup, run `bower install` and `npm install` to fetch dependencies.

The frontend uses a [Skosmos](https://github.com/NatLibFi/Skosmos) instance to query for subjects, and the Primo Search API through [SCS](https://github.com/scriptotek/scs) to query for catalogue records.

## Translation

The application is translated using gettext, supported
by [angular-gettext](https://github.com/rubenv/angular-gettext)
and [angular-gulp-gettext](https://github.com/gabegorelick/gulp-angular-gettext).

* Run `gulp pot` to extract translatable strings from
  the application into the POT file `po/emnesok.pot`.

* Translate. If using Poedit, start a new translation from the
  POT file, or open an existing translation file like `po/nb.po`,
  then choose "Catalogue" > "Update from POT file" to update
  the translation.

* Run `gulp translations` to compile JavaScript files in
  `dist/translations` from PO files in the `po` folder.

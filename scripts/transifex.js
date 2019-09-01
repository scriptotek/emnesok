var fs = require('fs');
var path = require('path');
var TransifexApi = require('transifex-api-es6');
require('dotenv').config();

var transifex = new TransifexApi({
    user: process.env.TRANSIFEX_USERNAME,
    password: process.env.TRANSIFEX_PASSWORD,
    projectName: 'subject-search',
});

// Until PR is merged
transifex.baseUrl = `https://www.transifex.com/api/2/project/subject-search`;

let resource = 'emnesok'
let resourceSlug = `master`;
let languages = ['nb', 'nn'];
let poDir = path.join(__dirname, '../src/po/');
let potFile = path.join(poDir, `${resource}.pot`);


function pull() {
    return Promise.all(
        languages.map(
            lang => transifex.getResourceTranslation(lang, resourceSlug)
                .then(poData => {
                    let poFile = path.join(poDir, `${lang}/${resource}.po`);
                    fs.writeFileSync(poFile, poData);
                    console.log(`Wrote ${poFile}`);
                })
                .catch(err => {
                    console.error(err)
                })
        )
    )
}

function push() {
    transifex.getResource(resourceSlug)
        .then(data => {
            return {
                i18n_type: data.i18n_type,
                name: data.name,
                slug: data.slug,
                content: fs.createReadStream(potFile),
            };
        })
        .then(resourceData => {
            return transifex.updateResource(resourceData, resourceSlug);
        })
        .then(results => {
            console.log('Results:');
            console.log(results);
        })
        .catch((err) => {
            console.error(err);
        });
}

switch (process.argv[2]) {
case 'pull':
    pull();
    break;
case 'push':
    push();
    break;
default:
    console.log('Unknown command!');
}

import angular from 'angular';
import {searchBoxComponentName, searchBoxComponent} from './searchBox.js';

const moduleName = 'app.search';

export default moduleName;

angular
    .module(moduleName,
        [
            'app.services.config',
            'app.services.lang',
            'app.services.authority',
            'app.services.externals',
        ]
    )
    .component(searchBoxComponentName, searchBoxComponent);

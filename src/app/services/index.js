import angular from 'angular';

import configModule from './config.service';
import externalsModule from './externals.service';
import institutionModule from './institution.service';
import langModule from './lang.service';
import sessionModule from'./session.service';
import titleModule from './title.service';
import authorityModule from './authority.service';

const moduleName = 'app.services';

angular.module(moduleName, [
    configModule,
    externalsModule,
    institutionModule,
    langModule,
    sessionModule,
    titleModule,
    authorityModule,
]);

export default moduleName;
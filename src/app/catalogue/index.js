import angular from 'angular';
import {catalogueResultsComponentName, catalogueResultsComponent} from './catalogueResults';
import {catalogueResultComponentName, catalogueResultComponent} from './catalogueResult';
import {availabilityComponentName, availabilityComponent} from './availability';
import {catalogueServiceName, catalogueService} from './catalogue.service';

const moduleName = 'app.catalogue';

export default moduleName;

angular
    .module(moduleName, [])
    .factory(catalogueServiceName, catalogueService)
    .component(catalogueResultsComponentName, catalogueResultsComponent)
    .component(catalogueResultComponentName, catalogueResultComponent)
    .component(availabilityComponentName, availabilityComponent);
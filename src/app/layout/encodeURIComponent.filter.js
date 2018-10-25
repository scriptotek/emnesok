/**
 * @desc filter to invoke encodeURIComponent
 * @example <a ng-href="http://example.com?q={{ query | encodeURIComponent }}">Link</a>
 */

export const encodeURIComponentFilterName = 'encodeURIComponent';

export const encodeURIComponentFilter = /* @ngInject */ function($window) {
    return $window.encodeURIComponent;
};

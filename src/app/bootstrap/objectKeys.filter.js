export const objectKeysFilterName = 'objectKeys';

export const objectKeysFilter = /* @ngInject */ function () {
    return function(item) {
        if (!item) return null;
        var keys = Object.keys(item);
        keys.sort();
        return keys;
    };
};

define(['jquery', 'knockout', './router', 'bootstrap', 'knockout-projections'], function ($, ko, router) {

    ko.components.register('nav-bar', { require: 'components/nav-bar/nav-bar' });
    ko.components.register('home-page', { require: 'components/home-page/home' });
    ko.components.register('about-page', { require: 'components/about-page/about' });

    ko.applyBindings({ route: router.currentRoute });
});

define(["jquery", "knockout", "crossroads", "historyjs"], function ($, ko, crossroads) {

    return new Router({
        routes: [
            { url: '/{?params}', params: { page: 'home-page', title: 'Home' } },
            { url: '/', params: { page: 'home-page', title: 'Home' } },
            { url: 'about', params: { page: 'about-page', title: 'About' } }
        ]
    });

    function Router(config) {
        var currentRoute = this.currentRoute = ko.observable({});

        // cast url params to objects
        crossroads.shouldTypecast = true;

        // found a Route
        crossroads.routed.add(function(request, data) {
            document.title = data.params[0].title;
        });

        // can't find a route
        crossroads.bypassed.add(function(request) {
            History.replaceState({
                urlPath: '/'
            }, "Home", '/');

            crossroads.parse(config.routes[0].url);
        });

        // register routes
        ko.utils.arrayForEach(config.routes, function (route) {
            crossroads.addRoute(route.url, function (requestParams) {
                currentRoute(ko.utils.extend(requestParams, route.params));
            });
        });

        // init
        activateCrossroads();
        customHrefBinding();
    }

    function activateCrossroads() {
        History.Adapter.bind(window, "statechange", routeCrossRoads);
        crossroads.normalizeFn = crossroads.NORM_AS_OBJECT;

        routeCrossRoads();
    }

    function routeCrossRoads()
    {
        var State = History.getState();

        if (State.data.urlPath) {
            return crossroads.parse(State.data.urlPath);
        }
        else {
            if (State.hash.length > 1) {
                return crossroads.parse(State.hash);
            }
            else {
                return crossroads.parse('/');
            }
        }
    }

    function customHrefBinding() {

        $("body").on("click", "a", function (e) {
            var urlPath = $(this).attr("href");

            if (urlPath.slice(0, 1) == "#" || urlPath.toLowerCase().indexOf('javascript') > -1) {
                return true;
            }

            e.preventDefault();

            return History.pushState({
                urlPath: urlPath
            }, null, urlPath);
        });
    }

});

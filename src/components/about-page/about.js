define(["knockout", "text!./about.html"], function(ko, homeTemplate) {

  function AboutViewModel(route) {
      this.loaded = ko.observable("Yes, it was!!!");
  }

  return { viewModel: AboutViewModel, template: homeTemplate };

});

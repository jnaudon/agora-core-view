angular.module('avAdmin').run(function(AdminPlugins) {
    // Adding to the sidebar params:
    // name, icon-name (fa), head or sub, text to show
    AdminPlugins.add("test", "check", true, "testplugin.text");
});

// Using the admin controller to get the topbar and the sidebar
// The state name should be admin.NAME
angular.module('agora-core-view').config(
  function($stateProvider) {
    $stateProvider
      .state('admin.test',
        { url: '/test',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        });
  });

// Custom directive, the name should be avPluginNAME and here we can put the magic
angular.module('avAdmin')
  .directive('avPluginTest', function() {
    function link(scope, element, attrs) {
    }

    return {
      restrict: 'AEC',
      scope: {
      },
      link: link,
      template: '<h1 ng-i18next>testplugin.header</h1>'
    };
  });

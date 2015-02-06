angular.module('avAdmin')
  .directive('avAdminDashboard', ["$state", "AuthApi", "ElectionsApi", "$stateParams", function($state, AuthApi, ElectionsApi, $stateParams) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        var id = $stateParams.id;

        if (!id) {
            $state.go("admin.basic");
        }

        var statuses = [
            'registered',
            'created',
            'started',
            'stopped',
            'tally_ok',
            'results_ok'
        ];

        var nextactions = [
            'avAdmin.dashboard.create',
            'avAdmin.dashboard.start',
            'avAdmin.dashboard.stop',
            'avAdmin.dashboard.tally',
            'avAdmin.dashboard.publish'
        ];

        scope.statuses = statuses;
        scope.election = {};
        scope.index = 0;
        scope.nextaction = 0;
        scope.loading = true;
        scope.waiting = false;
        scope.error = null;
        scope.msg = null;
        scope.prevStatus = null;

        ElectionsApi.getElection(id)
            .then(function(el) {
                scope.loading = false;
                scope.election = el;
                scope.intally = el.status === 'doing_tally';
                if (scope.intally) {
                    scope.index = statuses.indexOf('stopped') + 1;
                    scope.nextaction = false;
                } else {
                    scope.index = statuses.indexOf(el.status) + 1;
                    scope.nextaction = nextactions[scope.index - 1];
                }

                //if (scope.election.status === 'registered') {
                //    reload();
                //}

            });

        function reload() {
            scope.loading = true;
            scope.prevStatus = scope.election.status;
            scope.waiting = true;
            setTimeout(waitElectionChange, 1000);
        }

        function waitElectionChange() {
            var ignorecache = true;
            ElectionsApi.getElection(id, ignorecache)
                .then(function(el) {
                    if (el.status === scope.prevStatus && scope.waiting) {
                        setTimeout(waitElectionChange, 1000);
                    } else {
                        scope.waiting = false;
                        scope.loading = false;
                        scope.prevStatus = null;
                        scope.election = el;

                        scope.intally = el.status === 'doing_tally';
                        if (scope.intally) {
                            scope.index = statuses.indexOf('stopped') + 1;
                            scope.nextaction = false;
                            scope.prevStatus = scope.election.status;
                            scope.waiting = true;
                            waitElectionChange();
                        } else {
                            scope.index = statuses.indexOf(el.status) + 1;
                            scope.nextaction = nextactions[scope.index - 1];
                        }
                    }
                });
        }

        function doAction(index) {
            if (scope.intally) {
                return;
            }

            scope.loading = true;
            scope.prevStatus = scope.election.status;
            scope.waiting = true;
            setTimeout(waitElectionChange, 1000);

            var commands = [
                {path: 'register', method: 'GET'},
                {path: 'create', method: 'POST'},
                {path: 'start', method: 'POST'},
                {path: 'stop', method: 'POST'},
                {path: 'tally', method: 'POST'},
                // TODO add config to calculate results
                {path: 'calculate-results', method: 'POST', data: [
                    [
                        "agora_results.pipes.results.do_tallies",
                        {"ignore_invalid_votes": true}
                    ]
                ]},
            ];
            var c = commands[index];
            ElectionsApi.command(scope.election, c.path, c.method, c.data)
                .catch(function(error) { scope.loading = false; scope.error = error; });

            if (c.path === 'start') {
                AuthApi.changeAuthEvent(scope.election.id, 'started')
                    .error(function(error) { scope.loading = false; scope.error = error; });
            }

            if (c.path === 'stop') {
                AuthApi.changeAuthEvent(scope.election.id, 'stopped')
                    .error(function(error) { scope.loading = false; scope.error = error; });
            }
        }

        function sendAuthCodes(election) {
            scope.loading = true;
            AuthApi.sendAuthCodes(election.id)
                .success(function(r) {
                    scope.loading = false;
                    scope.msg = "avAdmin.dashboard.censussend";
                })
                .error(function(error) { scope.loading = false; scope.error = error.error; });
        }

        angular.extend(scope, {
          doAction: doAction,
          sendAuthCodes: sendAuthCodes,
        });
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-directives/dashboard/dashboard.html'
    };
  }]);

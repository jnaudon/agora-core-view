/*
 * Review screen directive.
 *
 * Shows the steps to the user.
 */
angular.module('avBooth')
  .directive('avbReviewScreen', function() {
    return {
      restrict: 'E',
      templateUrl: 'avBooth/review-screen-directive/review-screen-directive.html'
    };
  });
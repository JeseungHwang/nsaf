/*angular.module('titleApp',['ngMaterial'])
 	.controller('AppCtrl', function($scope, $timeout, $mdSidenav, $mdDialog) {
		$scope.toggleLeft = buildToggler('left');
    	$scope.toggleRight = buildToggler('right');

    	function buildToggler(componentId) {return function() {
			$mdSidenav(componentId).toggle();
		}

		 this.openMenu = function($mdOpenMenu, ev) {
	      originatorEv = ev;
	      $mdOpenMenu(ev);
	    };
    }
});
*/

angular.module('MainApp',['ngMaterial'])
	 	.controller('AppCtrl', function($scope, $timeout, $mdSidenav, $mdDialog) {
				$scope.toggleLeft = buildToggler('left');
		    	$scope.toggleRight = buildToggler('right');

		    	function buildToggler(componentId) {return function() {
					$mdSidenav(componentId).toggle();
				}

				 this.openMenu = function($mdOpenMenu, ev) {
			      originatorEv = ev;
			      $mdOpenMenu(ev);
			    };
		    }
		});
define(function () {
	var current = {

		/**
		 * Render Git repository.
		 */
		renderKey: function (subscription) {
			return current.$super('renderKey')(subscription, 'service:scm:repository');
		},

		/**
		 * Render Git home page.
		 */
		renderFeatures: function (subscription) {
			return current.$super('renderFeaturesScm')(subscription, 'git');
		},
		
		configureSubscriptionParameters: function (configuration, $container) {
			configuration.type = 'git';
			return current.$super('configureSubscriptionParameters')(configuration, $container);
		},
		
	};
	return current;
});

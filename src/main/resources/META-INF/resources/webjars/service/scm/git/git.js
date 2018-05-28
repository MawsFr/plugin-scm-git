define(function () {
	var current = {

		configureSubscriptionParameters: function (configuration, $container) {
			current.registerIdOu(configuration, $container, 'service:scm:ou');
			current.registerIdProject(configuration, $container, 'service:scm:project');
			current.registerIdRepositorySelect2(configuration, $container, 'service:scm:repository');
			current.registerIdLdapGroupsSelect2(configuration, $container, 'service:scm:ldapgroups');
		},

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
		
		/**
		 * Replace the input by a select2 in link mode. In creation mode, disable manual edition of 'repository',
		 * and add a simple text with live
		 * validation regarding existing client and syntax.
		 */
		registerIdRepositorySelect2: function (configuration, $container, id) {
			var cProviders = configuration.providers['form-group'];
			var previousProvider = cProviders[id] || cProviders.standard;
			if (configuration.mode === 'create') {
				cProviders[id] = function (parameter, container, $input) {
					// Disable computed parameters and remove the description, since it is overridden
					var parentParameter = $.extend({}, parameter);
					parentParameter.description = null;
					var $fieldset = previousProvider(parentParameter, container, $input).parent();
					$input.attr('readonly', 'readonly');
				};
				configuration.renderers[id] = current.setPkey;
			} else {
				current.$super('registerXServiceSelect2')(configuration, id, 'service/scm/git/', null, true, null, false);
			}
		},
		/**
		 * Live validation of LDAP group, OU and parent.
		 */
		validateIdRepositoryCreateMode: function () {
			validationManager.reset(_('service:scm:repository'));
			var $input = _('service:scm:repository');
			var project = _('service:scm:project').val();
			var organisation = _('service:scm:ou').val();
			var fullName = ((organisation || '') + ((organisation && project) ? ('-' + project) : (!organisation && project ? project : ''))).toLowerCase();
			$input.val(fullName).closest('.form-group').find('.form-control-feedback').remove().end().addClass('has-feedback');
			if (fullName !== current.$super('model').pkey && !fullName.startsWith(current.$super('model').pkey + '-')) {
				validationManager.addError($input, {
					rule: 'StartsWith',
					parameters: current.$super('model').pkey
				}, 'repository', true);
				return false;
			}
			// Live validation to check the group does not exists
			validationManager.addMessage($input, null, [], null, 'fas fa-sync-alt fa-spin');
//			$.ajax({
//				dataType: 'json',
//				url: REST_PATH + 'service/id/group/' + encodeURIComponent(fullName) + '/exists',
//				type: 'GET',
//				success: function (data) {
//					if (data) {
//						// Existing project
//						validationManager.addError(_('service:scm:git:group'), {
//							rule: 'already-exist',
//							parameters: ['service:scm:git:group', fullName]
//						}, 'repository', true);
//					} else {
//						// Succeed, not existing project
//						validationManager.addSuccess($input, [], null, true);
//					}
//				}
//			});

			// For now return true for the immediate validation system, even if the Ajax call may fail
			return true;
		},
		
		registerIdLdapGroupsSelect2: function (configuration, $container, id) {
			current.$super('registerXServiceSelect2')(configuration, id, 'service/id/ldap/group/subscriptions/' + current.$super('model').id + '/', null, false);
		},
		
		registerIdOu: function (configuration, $container, id) {
			configuration.validators[id] = current.validateIdRepositoryCreateMode;
			// Do other things specific to Ou
			configuration.renderers[id] = current.setPkey;
		},
		
		registerIdProject: function (configuration, $container, id) {
			// Do other things specific to Project
			configuration.validators[id] = current.validateIdRepositoryCreateMode;
		},
		
		setPkey: function (parameter, $input) {
			$input.val(current.$super('model').pkey);
			$input.attr('readonly', 'readonly');
		}
	};
	return current;
});

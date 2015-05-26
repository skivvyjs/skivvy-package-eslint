'use strict';

var eslint = require('eslint');
var stylish = require('eslint/lib/formatters/stylish');

module.exports = function(config) {
	var files = config.files;
	var eslintOptions = config.options;
	var api = this;
	if (!files) {
		throw new api.errors.TaskError('No source files specified');
	}

	var cli = new eslint.CLIEngine(eslintOptions);

	var filesArray = Array.isArray(config.files) ? config.files : [config.files];
	var results = cli.executeOnFiles(filesArray);
	var hasErrors = results.errorCount > 0;
	var hasWarnings = results.warningCount > 0;
	if (hasErrors) {
		printResults(results);
		var error = new api.errors.TaskError('Lint failed');
		error.results = results;
		throw error;
	}
	if (hasWarnings) {
		printResults(results);
	}

	return results;


	function printResults(results) {
		var formattedResults = stylish(results.results);
		console.log(formattedResults);
	}
};

module.exports.defaults = {
	files: null,
	options: {
		configFile: null,
		envs: [],
		extensions: ['.js'],
		globals: [],
		ignore: true,
		ignorePath: null,
		reset: false,
		baseConfig: null,
		rulePaths: [],
		rules: null,
		useEslintrc: true
	}
};

module.exports.description = 'Lint source files using ESLint';

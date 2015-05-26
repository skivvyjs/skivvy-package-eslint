'use strict';

var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');
var mockCli = require('mock-cli');

chai.use(sinonChai);

describe('task:eslint', function() {
	var mockApi;
	var mockEslint;
	var mockStylish;
	var task;
	before(function() {
		mockApi = createMockApi();
		mockEslint = createMockEslint();
		mockStylish = createMockStylish();
		task = rewire('../../lib/tasks/eslint');
		task.__set__('eslint', mockEslint);
		task.__set__('stylish', mockStylish);
	});

	var unmockCli = null;
	afterEach(function() {
		if (unmockCli) {
			unmockCli();
			unmockCli = null;
		}
		mockEslint.reset();
		mockStylish.reset();
	});

	function createMockApi() {
		return {
			errors: {
				TaskError: createCustomError('TaskError')
			}
		};

		function createCustomError(type) {
			function CustomError(message) {
				this.message = message;
			}

			CustomError.prototype = Object.create(Error.prototype);
			CustomError.prototype.name = type;

			return CustomError;
		}
	}

	function createMockEslint() {
		var eslint = {
			CLIEngine: sinon.spy(function(options) {
				var cli = {
					executeOnFiles: sinon.spy(function(files) {
						if ((files.length === 1) && (files[0] === 'error')) {
							throw new Error('Program error');
						}

						var errorResults = files.filter(function(filename) {
							return path.basename(filename) === 'error.js';
						}).map(function(filename) {
							return {
								filePath: filename,
								messages: [
									{
										fatal: false,
										severity: 2,
										ruleId: 'semi',
										line: 1,
										column: 23,
										message: 'Expected a semicolon.'
									}
								],
								errorCount: 1,
								warningCount: 0
							};
						});

						var warningResults = files.filter(function(filename) {
							return path.basename(filename) === 'warning.js';
						}).map(function(filename) {
							return {
								filePath: filename,
								messages: [
									{
										fatal: false,
										severity: 1,
										ruleId: 'semi',
										line: 1,
										column: 23,
										message: 'Expected a semicolon.'
									}
								],
								errorCount: 0,
								warningCount: 1
							};
						});

						var errorCount = errorResults.length;
						var warningCount = warningResults.length;
						return {
							results: errorResults.concat(warningResults),
							errorCount: errorCount,
							warningCount: warningCount
						};
					})
				};
				eslint.CLIEngine.instance = cli;
				return cli;
			}),
			reset: function() {
				eslint.CLIEngine.reset();
				delete eslint.CLIEngine.instance;
			}
		};
		return eslint;
	}

	function createMockStylish() {
		return sinon.spy(function(results) {
			var errorCount = results.reduce(function(errorCount, result) {
				return errorCount + result.errorCount;
			}, 0);
			var warningCount = results.reduce(function(warningCount, result) {
				return warningCount + result.warningCount;
			}, 0);
			return errorCount + ' error(s), ' +
				warningCount + ' warning(s)';
		});
	}

	it('should have a description', function() {
		expect(task.description).to.be.a('string');
	});

	it('should specify default configuration', function() {
		expect(task.defaults).to.eql({
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
		});
	});

	it('should throw an error if no source path is specified', function() {
		var attempts = [
			function() { return task.call(mockApi, {}); },
			function() { return task.call(mockApi, { files: undefined }); },
			function() { return task.call(mockApi, { files: null }); },
			function() { return task.call(mockApi, { files: false }); }
		];
		attempts.forEach(function(attempt) {
			expect(attempt).to.throw(mockApi.errors.TaskError);
			expect(attempt).to.throw('No source files');
		});
	});

	it('should lint files (success)', function() {
		unmockCli = mockCli();
		var results = task.call(mockApi, {
			files: [
				'/project/src/success.js',
				'/project/src/success.js',
				'/project/src/success.js'
			],
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
		});
		var cli = unmockCli();
		expect(results).to.eql({
			results: [],
			errorCount: 0,
			warningCount: 0
		});
		expect(cli.stdout).to.equal('');
		expect(mockEslint.CLIEngine).to.have.been.calledWith({
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
		});
		expect(mockEslint.CLIEngine.instance.executeOnFiles).to.have.been.calledWith([
			'/project/src/success.js',
			'/project/src/success.js',
			'/project/src/success.js'
		]);
	});

	it('should lint files (warnings)', function() {
		var unmockCli = mockCli();
		var results = task.call(mockApi, {
			files: [
				'/project/src/success.js',
				'/project/src/warning.js',
				'/project/src/warning.js'
			]
		});
		var cli = unmockCli();
		var expectedResults = {
			results: [
				{
					filePath: '/project/src/warning.js',
					messages: [
						{
							fatal: false,
							severity: 1,
							ruleId: 'semi',
							line: 1,
							column: 23,
							message: 'Expected a semicolon.'
						}
					],
					errorCount: 0,
					warningCount: 1
				},
				{
					filePath: '/project/src/warning.js',
					messages: [
						{
							fatal: false,
							severity: 1,
							ruleId: 'semi',
							line: 1,
							column: 23,
							message: 'Expected a semicolon.'
						}
					],
					errorCount: 0,
					warningCount: 1
				}
			],
			errorCount: 0,
			warningCount: 2
		};
		expect(results).to.eql(expectedResults);
		expect(mockStylish).to.have.been.calledWith(results.results);
		expect(cli.stdout).to.equal('0 error(s), 2 warning(s)\n');
	});

	it('should lint files (failure)', function() {
		unmockCli = mockCli();
		var caughtError;
		try {
			task.call(mockApi, {
				files: [
					'/project/src/success.js',
					'/project/src/warning.js',
					'/project/src/error.js'
				]
			});
		} catch (error) {
			caughtError = error;
		}
		var cli = unmockCli();
		expect(caughtError).to.exist;
		expect(caughtError.message).to.contain('Lint failed');
		expect(caughtError.results).to.be.an('object');
		var results = caughtError.results;
		var expectedResults = {
			results: [
				{
					filePath: '/project/src/error.js',
					messages: [
						{
							fatal: false,
							severity: 2,
							ruleId: 'semi',
							line: 1,
							column: 23,
							message: 'Expected a semicolon.'
						}
					],
					errorCount: 1,
					warningCount: 0
				},
				{
					filePath: '/project/src/warning.js',
					messages: [
						{
							fatal: false,
							severity: 1,
							ruleId: 'semi',
							line: 1,
							column: 23,
							message: 'Expected a semicolon.'
						}
					],
					errorCount: 0,
					warningCount: 1
				}
			],
			errorCount: 1,
			warningCount: 1
		};
		expect(results).to.eql(expectedResults);
		expect(mockStylish).to.have.been.calledWith(expectedResults.results);
		expect(cli.stdout).to.equal('1 error(s), 1 warning(s)\n');
	});

	it('should convert files string into array of files)', function() {
		var results = task.call(mockApi, {
			files: '/project/src/success.js'
		});
		expect(results).to.eql({
			results: [],
			errorCount: 0,
			warningCount: 0
		});
		expect(mockEslint.CLIEngine.instance.executeOnFiles).to.have.been.calledWith([
			'/project/src/success.js'
		]);
	});

	it('should throw error on library error', function() {
		var attempt = function() {
			return task({ files: ['error'] });
		};
		expect(attempt).not.to.throw(mockApi.errors.TaskError);
		expect(attempt).to.throw('Program error');
	});
});

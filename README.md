# karma-failure-snapshots-qunit

[![NPM version](https://badge.fury.io/js/karma-failure-snapshots-qunit.png)](http://badge.fury.io/js/karma-failure-snapshots-qunit)
[![Dependency Status](https://david-dm.org/prantlf/karma-failure-snapshots-qunit.svg)](https://david-dm.org/prantlf/karma-failure-snapshots-qunit)
[![devDependency Status](https://david-dm.org/prantlf/karma-failure-snapshots-qunit/dev-status.svg)](https://david-dm.org/prantlf/karma-failure-snapshots-qunit#info=devDependencies)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![NPM Downloads](https://nodei.co/npm/karma-failure-snapshots-qunit.png?downloads=true&stars=true)](https://www.npmjs.com/package/karma-failure-snapshots-qunit)

[Karma] plugin for taking snapshots of the web browser state whenever a [QUnit] test fails.

If your tests fail in an environment, which is difficult to debug, or if they do not fail during debugging, or if they fail intermittently, this plugin may help you to investigate the problem.

This is a unit test framework extension for the [karma-failure-snapshots] plugin. You will find more information about the failure snapshots there.

### Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Writing Tests](#writing-tests)
- [Contributing](#contributing)
- [Release History](#release-history)
- [License](#license)

## Installation

Make sure, that you have installed [Node.js] 8 or newer. Then you can install this plugin by [NPM] or [Yarn]:

    npm install --save-debug karma-failure-snapshots-qunit

Usually you will install this plugin together with `karma` itself and `QUnit`. For example, the typical installation:

    npm install --save-debug karma karma-qunit qunit
        karma-chrome-launcher karma-firefox-launcher \
        karma-failure-snapshots karma-failure-snapshots-qunit

See an [example] how to introduce tests with failure snapshots in a project.

## Configuration

This plugin has to be aded to the `frameworks` array in the Karma configuration file, usually `karma.conf.js`:

    frameworks: [ 'failure-snapshots-qunit', ... ],

You will add it with the main plugin, which you will place in back of it. When you add the `QUnit` framework plugin, make sure, that you *place the failure snapshot plugins before it*. For example, a typical configuration:

    module.exports = function (config) {
      config.set({
        frameworks: [
          'failure-snapshots-qunit', 'failure-snapshots', 'qunit'
        ],
        ...
      })
    }

See the [common plugin options] for more information about the customization and the [main plugin configuration] for more information. 


## Writing Tests

You will not need to modify your tests, if you do not use hooks for set-up and tear-down phases. The snapshots will just be taken, once a test spec fails or throws an unexpected error. For example, a typical test:

    QUnit.module('test suite', function (hooks) {
      QUnit.test('test spec 1', function (assert) {
        ...
      })

      ...
    })

The automatic snapshot taking is using a `QUnit` global `testDone` hook. This hook is called after `afterEach` and `after` hooks. If you use them to implement set-up and tear-down phases, including a page clean-up, it will remove content important for inspection, before the snapshot will be taken and thus not be useful:

    QUnit.module('test suite', function (hooks) {
      hooks.before(function () {
        // Render a component in the document body
      })

      hooks.after(function () {
        // Clean up the document body
      })

      QUnit.test('test spec 1', function (assert) {
        ...
      })

      ...
    })

If you have such clean-up, insert an additional `afterEach` hook before the clean-up, which will make the snapshot of the problem:

    QUnit.module('test suite', function (hooks) {
      // Ensure that a snapshot is taken immediately in case of failure
      hooks.afterEach(window.ensureFailureSnapshot)

      hooks.before(function () {
        // Render a component in the document body
      })

      hooks.after(function () {
        // Clean up the document body
      })

      QUnit.test('test spec 1', function (assert) {
        ...
      })

      ...
    })

The `ensureFailureSnapshot` will take a failure snapshot only if there is a failure. If there is no failure, this function will return without doing anything.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.  Add unit tests for any new or changed functionality. Lint and test your code using Grunt.

## Release History

* 2019-07-15   v0.0.1   Initial release

## License

Copyright (c) 2019 Ferdinand Prantl

Licensed under the MIT license.

[karma-failure-snapshots]: https://github.com/prantlf/karma-failure-snapshots#readme
[Node.js]: https://nodejs.org/
[NPM]: https://www.npmjs.com/get-npm
[Yarn]: https://yarnpkg.com/lang/en/docs/install/
[Karma]: https://karma-runner.github.io/
[QUnit]: https://qunitjs.com/
[common plugin options]: https://github.com/prantlf/karma-failure-snapshots#configuration
[main plugin configuration]: https://github.com/prantlf/karma-failure-snapshots#options

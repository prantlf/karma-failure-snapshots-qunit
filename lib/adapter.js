/* global QUnit */

(function () {
  'use strict'

  var failureSnapshots = window.__failure_snapshots__
  var config = window.__karma__.config.failureSnapshots || {}
  var includePassed = config.includePassed
  var hideFunctionsFrom = config.hideFunctionsFrom || ['qunit.js']
  var assertionFailed
  var earlySnapshot
  var lastFailure
  var lastTest

  function formatDescription (test) {
    return test.fullName.join(' ')
  }

  window.ensureFailureSnapshot = function () {
    if (assertionFailed || includePassed) {
      return failureSnapshots
        .takeFailureSnapshot()
        .then(function (output) {
          earlySnapshot = output
        })
        .catch(function (error) {
          console.log('Taking the failure snapshot failed:')
          console.log(' ', formatDescription(lastTest))
          console.error(error)
        })
    }
    return Promise.resolve()
  }

  function initiateTest (test) {
    lastTest = test
    assertionFailed = false
    earlySnapshot = undefined
    lastFailure = undefined
  }

  function recognizeFailure (test) {
    if (!test.result) {
      assertionFailed = true
    }
  }

  function describeFailure (test) {
    var status = test.status
    var failed = status === 'failed'
    if (failed || includePassed) {
      var assertions = test.assertions
      var firstFailure = assertions.find(function (failure) {
        return failure.passed === false
      }) || assertions[0]
      var message = firstFailure.message || 'Unknown.'
      var stack = firstFailure.stack || ''
      if (stack.indexOf(message) < 0) {
        stack = stack ? message + '\n' + stack : message
      }
      lastFailure = {
        description: formatDescription(test),
        stack: stack,
        failure: failed,
        pass: status === 'passed'
      }
    }
  }

  function collectFailure () {
    if (lastFailure) {
      lastFailure.earlySnapshot = earlySnapshot
      lastFailure.hideFunctionsFrom = hideFunctionsFrom
      return failureSnapshots.collectFailureSnapshot(lastFailure)
    }
  }

  QUnit.on('testStart', initiateTest)
  QUnit.on('testEnd', describeFailure)
  QUnit.log(recognizeFailure)
  QUnit.testDone(collectFailure)
})()

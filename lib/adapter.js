/* global QUnit */

(function () {
  'use strict'

  const failureSnapshots = window.__failure_snapshots__
  const config = window.__karma__.config.failureSnapshots || {}
  const includePassed = config.includePassed
  const hideFunctionsFrom = config.hideFunctionsFrom || ['qunit.js']
  let assertionFailed
  let earlySnapshot
  let lastFailure
  let lastTest

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
    const status = test.status
    const failed = status === 'failed'
    if (failed || includePassed) {
      const assertions = test.assertions
      const firstFailure = assertions.find(function (failure) {
        return failure.passed === false
      }) || assertions[0]
      const message = firstFailure.message || 'Unknown.'
      let stack = firstFailure.stack || ''
      if (stack.indexOf(message) < 0) {
        stack = stack ? message + '\n' + stack : message
      }
      lastFailure = {
        description: formatDescription(test),
        stack,
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

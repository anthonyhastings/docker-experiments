/**
 * Starts the test runner which in turn loads test frameworks,
 * assertion libraries and then executes tests.
 *
 * Example Usage:
 * gulp test
 * gulp test --watch
 */

import gulp from 'gulp';
import chalk from 'chalk';
import {argv as args} from 'yargs';
import globalSettings from '../../config';

// Attempt to load test suite package to see if it is present or not.
let testSuiteWrapper = false;

try {
    testSuiteWrapper = require('rehab-fe-skeleton-testsuite');
} catch (e) {}

gulp.task('test', (done) => {
    if (!testSuiteWrapper) {
        console.log(chalk.bgRed.white(
            ' FE Skeleton: Missing `rehab-fe-skeleton-testsuite` package. Please install in `devDependencies`.'
        ));
        console.log(chalk.bgRed.white(
            '              You can do so via `npm install rehab-fe-skeleton-testsuite --save-dev`.'
        ));
        done(1);
        return;
    }

    let karmaSettings = {
        configFile: globalSettings.taskConfiguration.test.configPath
    };

    if (args.watch) {
        karmaSettings.autoWatch = true;
        karmaSettings.singleRun = false;
    }

    testSuiteWrapper.runTests(karmaSettings, done);
});

module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.initConfig({
        mochaTest: {
            test: {
                src: 'test.js'
            }
        },
        jscs: {
            src: 'lib/',
            options: {
                config: '.jscsrc'
            }
        }
    });
    grunt.registerTask('test', ['mochaTest', 'jscs']);
};

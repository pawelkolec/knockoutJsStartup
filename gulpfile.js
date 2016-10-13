var express = require('gulp-express');
var less = require('gulp-less');
var inject = require('gulp-inject');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var watch = require('gulp-watch');
var batch = require('gulp-batch');

var bowerFiles = require('main-bower-files'), es = require('event-stream');

// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream'), path = require('path'), url = require('url');

// Gulp and plugins
var gulp = require('gulp'), rjs = require('gulp-requirejs-bundler'), concat = require('gulp-concat'), clean = require('gulp-clean'), filter = require('gulp-filter'),
    replace = require('gulp-replace'), uglify = require('gulp-uglify'), htmlreplace = require('gulp-html-replace'),
    connect = require('gulp-connect'), babelCore = require('babel-core'), babel = require('gulp-babel'), objectAssign = require('object-assign');

// Config
var requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('src/app/require.config.js') + '; require;'),
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './src',
        name: 'app/startup',
        paths: {
            requireLib: 'bower_modules/requirejs/require'
        },
        include: [
            'requireLib',
            'components/nav-bar/nav-bar',
            'components/home-page/home',
            'text!components/about-page/about.html'
        ],
        insertRequire: ['app/startup'],
        bundles: {
            // If you want parts of the site to load on demand, remove them from the 'include' list
            // above, and group them into bundles here.
            // 'bundle-name': [ 'some/module', 'another/module' ],
            // 'another-bundle-name': [ 'yet-another-module' ]
        }
    }),
    transpilationConfig = {
        root: 'src',
        skip: ['bower_modules/**', 'app/require.config.js'],
        babelConfig: {
            modules: 'amd',
            sourceMaps: 'inline'
        }
    },
    babelIgnoreRegexes = transpilationConfig.skip.map(function(item) {
        return babelCore.util.regexify(item);
    });

// Pushes all the source files through Babel for transpilation
gulp.task('js:babel', function() {
    return gulp.src(requireJsOptimizerConfig.baseUrl + '/**')
        .pipe(gulp.dest('./temp'));
});

// Discovers all AMD dependencies, concatenates together all required .js files, minifies them
gulp.task('js:optimize', ['js:babel'], function() {
    var config = objectAssign({}, requireJsOptimizerConfig, { baseUrl: 'temp' });
    return rjs(config)
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./dist/'));
})

// Builds the distributable .js files by calling Babel then the r.js optimizer
gulp.task('js', ['js:optimize'], function () {
    // Now clean up
    return gulp.src('./temp', { read: false }).pipe(clean());
});

gulp.task('less', function () {
  return gulp.src(['src/index.less', 'src/components/**/*.less'])
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('src/tmp/css'));
});

gulp.task('css', ['less'], function () {
    var target = gulp.src('src/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var cssFiles = gulp.src(['src/tmp/css/**/*.css'], {read: false });

    return target.pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower', ignorePath: 'src', relative: true }))
      .pipe(inject(es.merge(
        cssFiles
    ), { ignorePath: 'src', relative: true }))
    .pipe(gulp.dest('./src'));
});


// Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('build:css', ['less'], function () {

    var bowerCss = gulp.src(bowerFiles(['**/*.css']));
    var cssFiles = gulp.src(['src/tmp/css/**/*.css']);

    var combinedCss = es.merge(bowerCss, cssFiles).pipe(concat('css.css'));

    return combinedCss.pipe(minifyCss({ processImport: false })).pipe(gulp.dest('./dist/'));
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function() {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});

gulp.task('build', ['html', 'js', 'build:css'], function(callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
});

var taskServer = function (env) {

	var options = {
		cwd: undefined
	};

	options.env = process.env;
	options.env.NODE_ENV = env;

	express.run(['server.js'], options);
}

gulp.task('serve', ['css'], function () {
	taskServer('development');
});

gulp.task('serve:dist', ['build'], function () {
	taskServer('production');
});

gulp.task('watch', function () {
    // Endless stream mode
    watch(['**/*.js', '**/*.less'], batch(function (events, done) {
        gulp.start('css', done);
    }));
});

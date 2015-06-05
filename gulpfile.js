var gulp = require('gulp'),
	sass = require('gulp-sass'),
    del = require('del'),
    gulpif = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
	cssGlobbing = require('gulp-css-globbing'),
    minifyCss = require('gulp-minify-css');
	sourcemaps = require('gulp-sourcemaps'),
	fileinclude = require('gulp-file-include'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync'),
	reload = browserSync.reload,


/*===============================================
=            Gulp Config / Path Vars            =
===============================================*/


    addressLoc = '192.168.200.88', // Local machine specific IP address
    addressProd = '',  // Production server path

    pathSrc = 'src/', // Project Source Files
    pathDev = '.temp/', // Temp Directory path for development
    pathBuild = 'build/'; // Final build path


/*==================================
=            Gulp Tasks            =
==================================*/


// Cleaning Tasks... Sweep, Sweep, Trash
gulp.task('clean', function (cb) {
    del([pathDev,pathBuild], cb); // Removes .temp and build directory to ensure we are using most up to date versions
});


// Development SASS Processing, Auto Prefixer, & Sourcemaps ... Oh MY!
gulp.task('sass', function () {
    return gulp.src('src/sass/main.scss')
    .pipe(cssGlobbing({ extensions: ['.scss'] }))
    .pipe(sourcemaps.init())
    .pipe(sass({
        includePaths: ['src/third_party/foundation/scss'],
        errLogToConsole: true
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(pathDev + 'css/'))
    .pipe(reload({stream:true}));
});


// Partials include, Lets us use HTML files as includes... well any file
gulp.task('fileInclude', function() {
    gulp.src(['src/*.html'])
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(gulp.dest(pathDev))
    .pipe(reload({stream:true}));
});


// Browsersync Bro'
gulp.task('serve', function() {
    browserSync.init({
        xip: true,
        host: addressLoc, // Set above use local network ip address
        open: 'external',
        server: {
            baseDir: [pathDev, pathSrc] // Sets multiple root folders to reference scripts and css files
        }
    });
});


// Build server preview 
gulp.task ('serve:build',['build'], function() {
    browserSync.init({
        xip: true,
        host: addressLoc, // Set above use local network ip address
        open: 'external',
        snippetOptions: {
            rule: {
            match: /qqqqqqqqq/
            }
        },
        server: {
            baseDir: pathBuild // Build Directory
        }
    });
});


/*===================================
=            Build Tasks            =
===================================*/


// Build Sass Task 
gulp.task('buildSass', function () {
    return gulp.src('src/sass/main.scss')
    .pipe(cssGlobbing({ extensions: ['.scss'] }))
    .pipe(sass({
        includePaths: ['src/third_party/foundation/scss'],
        errLogToConsole: true,
        outputStyle: 'compressed',
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest(pathBuild + 'css/'))
});


// Build Includes & useref task
gulp.task('buildFiles', function() {

    var assets = useref.assets();
    
    gulp.src(['src/*.html']) 
    .pipe(fileinclude({ // File partial processing
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe(assets) // Useref Tasks
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest(pathBuild));
});


/*========================================
=            Gulp Build Tasks            =
========================================*/


// Default Watch Tasks
gulp.task('watch', ['sass','fileInclude','serve'], function () {
    gulp.watch("src/sass/**/*.scss", ['sass']);
    gulp.watch("src/**/*.html", ['fileInclude']);
    gulp.watch("src/**/*.js", ['reload']);
});


// Default Gulp Development Task 
gulp.task('default', ['clean'], function() {
    gulp.start('watch');
});


// Gulp production build task 
gulp.task('build', ['clean'], function() {
    gulp.start(['buildSass','buildFiles']);
});

var gulp = require('gulp');

// define plug-ins
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var cssnano = require('gulp-cssnano');
var flatten = require('gulp-flatten');
var uglify = require('gulp-uglify');
var annotate = require('gulp-ng-annotate');
var bower = require('main-bower-files');

gulp.task('build', function () {
  
  // app js
  gulp.src([
      'src/jquery.extended.js', 
      'src/common.js',
      'src/**/*.js', 
      'src/*.js',
      'src/google-autocomplete.js', 
      'src/google-analytics.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(annotate())
    .pipe(uglify())
    .pipe(gulp.dest('js'));
    
  // app css
  gulp.src([
      'css/app.css'
    ])
    .pipe(concat('app.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('css'));
    
    
  // bower js
  gulp.src([
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap/dist/js/bootstrap.js'
    ])
    .pipe(concat('bower.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js'));
    
  // bower css
  gulp.src([
      'bower_components/bootstrap/dist/css/bootstrap.css'
    ])
    .pipe(concat('bower.min.css'))
    //.pipe(cssnano())
    .pipe(gulp.dest('css'));
    
  // bower fonts
  gulp.src(bower())
    .pipe(filter(['*.eot', '*.woff', '*.svg', '*.ttf']))
    .pipe(flatten())
    .pipe(gulp.dest('fonts'));
});

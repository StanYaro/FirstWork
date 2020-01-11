var gulp  = require('gulp'), // Подключаем Gulp
    sass = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync = require('browser-sync').create(), // Подключаем Browser Sync
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    del = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
    sourcemaps = require('gulp-sourcemaps'), // Подключаем библиотеку  для генерации css sourscemaps
    gulpIf = require('gulp-if'), // Подключаем библиотеку для задания условий
    newer = require('gulp-newer'), // Подключаем библиотеку для проверки файлов
    notify = require('gulp-notify'), // Подключаем библиотеку для вывода ошибок
    plumber = require('gulp-plumber'), // Подключаем библиотеку для вывода ошибок
    uglify = require('gulp-uglify'); //Сжатие js
    cache = require('gulp-cache'); // Подключаем библиотеку кеширования

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('sass', function () {
  return gulp.src('src/css/main.scss')
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'Sass',
          message: err.message
        };
    })
  }))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulpIf(!isDevelopment, cssnano()))
    .pipe(gulp.dest('public/'));
});

gulp.task('clean', function () {
  return del('public');
});



//gulp.task('scripts', function() {
//    return gulp.src( 'frontend/assets/js/**/*.js')
//        .pipe(gulpIf(!isDevelopment, concat('libs.min.js')))
//        .pipe(gulpIf(!isDevelopment, uglify()))
//        .pipe(gulp.dest('public/js'));
//});


gulp.task('images', function(){
  return gulp.src('src/img/**/*.+(png|jpg|gif|svg|ico)')
  .pipe(gulpIf(!isDevelopment, cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))))
  .pipe(gulp.dest('public/img'));
});

gulp.task('html', function () {
  return gulp.src('src/**/*.html', {since: gulp.lastRun('html')})
    .pipe(gulp.dest('public'));
  });

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('html','sass','images'))
);

gulp.task('watch', function () {
  gulp.watch('src/css/**/*.*', gulp.series('sass'));
  //gulp.watch('src/js/**/*.*', gulp.series('scripts'));
  gulp.watch('src/*.html', gulp.series('html'));
  gulp.watch('src/img/**/*.*', gulp.series('images'));
  //gulp.watch('frontend/assets/**/*.*', gulp.series('assets'));
});

gulp.task('serve', function() {
    browserSync.init({
        server: 'public'
        });
    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series( 'build',  gulp.parallel('watch', 'serve') )
);
const { src, dest, watch, parallel, series } = require('gulp');

const scss         = require('gulp-sass')(require('sass'));
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const del          = require('del');

function browsersync() { // автоматически обновляет страницу
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function scripts() {
	return src([
		'node_modules/wow.js/dist/wow.js',
		'node_modules/jquery/dist/jquery.js',
		'app/js/main.js'
	])
	.pipe(concat('main.min.js')) //создает сжатый файл js
	.pipe(uglify()) //минифицирует
	.pipe(dest('app/js')) //создает папку js в app
	.pipe(browserSync.stream()) // автоматически обновляет скрипты с помощью browserSync
}

function styles() {
  return src([
		'node_modules/animate.css/animate.css',
		'app/scss/style.scss'
		])
    .pipe(scss({outputStyle: 'compressed'})) //сжимает/минифицирует css код 
    .pipe(concat('style.min.css')) //создает сжатый файл css
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'], //отслеживает автопрефикс в 10 последних версий браузера
      grid: true // автопрефикс в гридах
    }))
    .pipe(dest('app/css')) //создает папку css в app
    .pipe(browserSync.stream()) // автоматически обновляет стили с помощью browserSync
}

function images() {
	return src('app/images/**/*')
			.pipe(imagemin([ //оптимизация для gif, jpeg, png, svg
					imagemin.gifsicle({interlaced: true}),
					imagemin.mozjpeg({quality: 75, progressive: true}),
					imagemin.optipng({optimizationLevel: 5}),
					imagemin.svgo({
							plugins: [
									{removeViewBox: true},
									{cleanupIDs: false}
							]
					})
			]))
			.pipe(dest('dist/images')) //создает папку images в dist
}

function cleanDist() { // удаляет папку dist
	return del('dist')
}

function building() {
    return src([ // добавляет файлы в папку dist
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching() {
    watch(['app/scss/**/*.scss'], styles); //следит за всеми стилевыми файлами в scss и изменяет код
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); //следит за js файлами(кроме main.min.js) в scss и изменяет код
    watch(['app/*.html']).on('change', browserSync.reload); //следит за html файлом и изменяет код автоматически
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, building); // удаляет папку dist и пересоздает заново
exports.default = parallel(styles, scripts, browsersync, watching); //параллельно запускает функциии
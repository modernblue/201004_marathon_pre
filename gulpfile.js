var gulp = require('gulp');
var webserver = require('gulp-webserver');
var compass = require('gulp-compass');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var htmlmin = require("gulp-htmlmin");

const babel = require('gulp-babel');

// browser-sync
gulp.task('webserver', function(){
	gulp.src('./')//.がない場合エラーとなる
		.pipe(webserver({
			//host: '192.168.1.172',//IPconfigのIPv4アドレスを確認
			host: 'localhost',
			port: 8888,
			livereload: true
		})
	);
});

// htmlmin
gulp.task('htmlmin'/*, ["htmlhint"]*/, function() {
	gulp.src('_resource/**/*.html')
		// .pipe(htmlmin({
		// 	collapseWhitespace: true
		// }))
		.pipe(gulp.dest('./'));
});


// imagemin
gulp.task('imgmin', function(){
	var src_dir = '_resource/image/';
	var ast_dir = 'assets/image/';

	gulp.src(src_dir + '**/*.{png,jpg,gif,ico}')
		.pipe(imagemin())
		.pipe(gulp.dest(ast_dir));
});

// compass
gulp.task('compass', function(){
	return gulp.src('_resource/sass/**/*.scss')
		.pipe(plumber(
			{
				errorHandler: function(err) {
					console.log(err.messageFormatted);
					this.emit('end');
				}
			}
		))
		.pipe(compass({
			config_file: 'config.rb',
			comments: false,
			css: 'assets/css/',
			sass: '_resource/sass/'
		}));
});

// css-min
gulp.task('cssmin', ['compass'], function(){
	gulp.src('assets/css/**/*.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		//.pipe(cssmin())
		.pipe(gulp.dest('assets/css'));
});

// uglify
gulp.task('jsmin', function(){
	//gulp.src(['_resource/js/**/*.js', '!_resource/js/jquery*.js'])
	gulp.src(['_resource/js/**/*.js'])
		.pipe(plumber(
			{
				errorHandler: function(err) {
					console.log(err.messageFormatted);
					this.emit('end');
				}
			}
		))
		// .pipe(babel({
    //   presets: ['es2015']
    // }))
		/* .pipe(uglify()) //エラーが発生-あとで確認*/
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('assets/js/'));
});

// watch
gulp.task('watch', function(){
	gulp.watch('_resource/**/*.html', function(event){
		gulp.run('htmlmin');
	});
	gulp.watch('_resource/sass/**/*.scss', function(event){
		gulp.run('cssmin');
	});
	gulp.watch('_resource/js/**/*.js', function(event){
		gulp.run('jsmin');
	});
});

// default
gulp.task('default', ['webserver'/*, 'watch'*/], function(){
	//console.log('foo');
	gulp.run('watch');
});

// deploy
gulp.task('deploy', ['htmlmin', 'cssmin', 'jsmin', 'imgmin'], function(){
});

// gulp
gulp.task('babel', () => {
    // return gulp.src('_resource/js/**/*.js')
    return gulp.src('assets/js/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
				.pipe(uglify())
        .pipe(gulp.dest('assets/js/'));
});

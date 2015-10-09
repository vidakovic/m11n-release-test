/* jshint node: true */
"use strict";

var gulp = require("gulp"),
	g = require("gulp-load-plugins")({lazy: false}),
	rimraf = require("rimraf"),
	release = require('github-release'),
	pkg = require("./package"),
	exec = require("child_process").exec;


/**
 * Helpers
 */

function shell(cmd) {
	exec(cmd, function (err, stdout, stderr) {
    if(stdout) {
			console.log(stdout);
		}
    if(stderr) {
			console.log(stderr);
		}
  });
}

/**
 * Scripts
 */
gulp.task("clean", function (done) {
	rimraf("dist/**/*.js", done);
});

gulp.task("scripts", ["clean"], function () {
	return gulp.src([
		"index.js"])
		.pipe(g.umd({
			dependencies: function() {
				return [
					{
						name: "jquery-deferred",
						amd: "jquery-deferred",
						cjs: "jquery-deferred",
						global: "$",
						param: "$"
					},
					{
						name: "lodash",
						amd: "lodash",
						cjs: "lodash",
						global: "_",
						param: "_"
					},
					{
						name: "moment",
						amd: "moment",
						cjs: "moment",
						global: "moment",
						param: "moment"
					}
				];
			},
			exports: function() {
				return "m11n";
			},
			namespace: function() {
				return "m11n";
			}
		}))
		.pipe( gulp.dest("dist/") )
		.pipe(g.uglify())
		.pipe(g.rename({
			suffix: ".min"
		}))
		.pipe( gulp.dest("dist/") );
});

/**
 * Package
 */
gulp.task("package", ["scripts"], function () {
  return gulp.src(["dist/*.js", "package.json", "bower.json"])
    .pipe(g.tar(pkg.name + ".tar"))
    .pipe(g.gzip())
    .pipe(gulp.dest('dist'));
});

/**
 * Release
 */
gulp.task("release", function(){
 gulp.src("./dist/" + pkg.name + ".tar.gz")
   .pipe(release());
});

gulp.task("bump-major", function(){

	return gulp.src("./*.json")
		.pipe(g.bump({type:"major"}))
		.pipe(gulp.dest("./"));
});

gulp.task("bump-minor", function(){
	return gulp.src("./*.json")
		.pipe(g.bump({type:"minor"}))
		.pipe(gulp.dest("./"));
});

gulp.task("bump-patch", function(){
	return gulp.src("./*.json")
		.pipe(g.bump({type:"patch"}))
		.pipe(gulp.dest("./"));
});

gulp.task("build", ["package"]);

/**
 * Default task
 */
gulp.task("default", ["build"]);

/* jshint node: true */
"use strict";

var gulp = require("gulp"),
	g = require("gulp-load-plugins")({lazy: false}),
	rimraf = require("rimraf"),
	pkg = require("./package.json"),
	exec = require("child_process").exec;

gulp.registry(new g.gitflow());

/**
 * Helpers
 */

function shell(cmd, done) {
	exec(cmd, function (err, stdout, stderr) {
    if(stdout) {
			console.log(stdout);
		}
    if(stderr) {
			console.log(stderr);
		}
		if(done) {
			done();
		}
  });
}

/**
 * Scripts
 */
gulp.task("clean", function (done) {
	rimraf("dist/**/*.js", done);
});

gulp.task("scripts", gulp.series("clean"), function () {
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
gulp.task("package", gulp.series("scripts"), function () {
  return gulp.src(["dist/*.js", "package.json", "bower.json"])
    .pipe(g.tar(pkg.name + ".tar"))
    .pipe(g.gzip())
    .pipe(gulp.dest('dist'));
});

/**
 * Release
 */

gulp.task("release-publish", function () {
	return gulp.src("./dist/" + pkg.name + ".tar.gz")
  	.pipe(g.githubRelease({
			owner: "vidakovic",
			tag: /(\d*\.\d*\.\d*)/.exec(pkg.version)[1],
      repo: pkg.name,
			manifest: pkg
	 	}));
});

gulp.task("build", gulp.series("package"));

/**
 * Default task
 */
gulp.task("default", gulp.series("build"));

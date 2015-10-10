/* jshint node: true */
"use strict";

var gulp = require("gulp"),
	g = require("gulp-load-plugins")({lazy: false}),
	rimraf = require("rimraf"),
	pkg = require("./package.json"),
	exec = require("child_process").exec;


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

gulp.task("release-publish", function () {
	return gulp.src("./dist/" + pkg.name + ".tar.gz")
  	.pipe(g.githubRelease({
			owner: "vidakovic",
			tag: pkg.version,
      repo: pkg.name,
			manifest: pkg
	 	}));
});

gulp.task("release-start", function (done) {
	shell(
		"git flow release start " + pkg.version + " && " +
		"git flow release publish " + pkg.version + " && " +
		"git flow release track " + pkg.version,
		done);
});

gulp.task("release-finish", function (done) {
	shell(
		"git flow release finish -S -m \"release: Finish\"" + pkg.version + " && " +
		"git push --tags && " +
		"git checkout master && " +
		"git push && " +
		"git checkout develop && " +
		"git push",
		done);
});

gulp.task("release-major", ["bump-major", "changelog", "release-start", "release-finish", "package", "release-publish"]);

gulp.task("release-minor", ["bump-minor", "changelog", "release-start", "release-finish", "package", "release-publish"]);

gulp.task("release-patch", ["bump-patch", "changelog", "release-start", "release-finish", "package", "release-publish"]);

gulp.task("changelog", function () {
  return gulp.src("CHANGELOG.md")
    .pipe(g.conventionalChangelog({
      preset: "angular",
			releaseCount: 0
    }))
    .pipe(gulp.dest("./"))
		.pipe(g.git.commit("release: Update changelog"));
});

gulp.task("bump-major", function(){
	return gulp.src("./*.json")
		.pipe(g.bump({type:"major"}))
		.pipe(gulp.dest("./"))
		.pipe(g.git.commit("release: Bump major version"));
});

gulp.task("bump-minor", function(){
	return gulp.src("./*.json")
		.pipe(g.bump({type:"minor"}))
		.pipe(gulp.dest("./"))
		.pipe(g.git.commit("release: Bump minor version"));
});

gulp.task("bump-patch", function(){
	return gulp.src("./*.json")
		.pipe(g.bump({type:"patch"}))
		.pipe(gulp.dest("./"))
		.pipe(g.git.commit("release: Bump patch version"));
});

gulp.task("build", ["package"]);

/**
 * Default task
 */
gulp.task("default", ["build"]);

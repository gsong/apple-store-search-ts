import fs from 'fs';
import path from 'path';

import gulpLoadPlugins from 'gulp-load-plugins';
import jspm from 'jspm';
import runSequence from 'run-sequence';

import * as paths from './paths';
import environments from '../src/config/environments';
import gulp from './_gulp';

import packageSpec from '../package.json';


const $ = gulpLoadPlugins();


gulp.task('build:make-settings', () => {
  let env = process.env.ENV || 'development';
  let outfile = path.join(paths.SRC_DIR, paths.SETTINGS);
  let settings = environments[env];
  settings.VERSION = packageSpec.version;
  $.util.log(settings);

  return fs.writeFileSync(outfile,
`// Auto generated by gulp task
// Do **not** modify manually unless you know what you're doing
/* eslint-disable */
const settings = Object.freeze(${JSON.stringify(settings)});
export default settings;`);
});


gulp.task('build:jspm', ['compile:styles'], () => jspm.bundleSFX(
  paths.TMP_INDEX_JS, paths.BUILD_INDEX_JS, {
    minify: false,
    mangle: false,
    sourceMaps: true
  }
));


gulp.task('build:js', (callback) =>
  runSequence('build:jspm', 'js:replace_paths', callback)
);


gulp.task('build:html', () =>
  gulp.src(paths.SRC_INDEX_HTML)
  .pipe($.htmlReplace({'js': paths.INDEX_SCRIPT}))
  .pipe(gulp.dest(paths.BUILD_DIR))
);


gulp.task('build:images', () =>
  gulp.src(paths.TMP_IMAGE)
  .pipe($.imagemin({
    progressive: true,
    interlaced: true
  }))
  .pipe(gulp.dest(paths.BUILD_DIR))
);


gulp.task('build', (callback) =>
  runSequence(
    ['clean:build', 'build:make-settings', 'utils:copy_to_tmp'],
    ['build:js', 'build:html', 'build:images'],
    callback
  )
);

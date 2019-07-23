const gulp = require('gulp');
const path = require('path');

const PATH = {
    SOURCE: path.join(__dirname, './src'),
    TARGET: path.join(__dirname, './dest')
};

gulp.task('copy', copyTask({
    source: './public/',
    destinations: ['./dest/public'],
}));

function copyTask(opts) {
    const {
        source,
        destination,
        destinations = [destination],
        pattern = '**/*'
    } = opts;

    return () => {
        let stream = gulp.src(source + pattern, {base: source});
        destinations.forEach((destination) => {
            stream = stream.pipe(gulp.dest(destination))
        });

        return stream;
    }
}

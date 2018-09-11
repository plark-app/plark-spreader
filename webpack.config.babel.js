const path = require('path');
const webpack = require('webpack');

const noop = function () {
};

// env
const isDev = process.env.NODE_ENV !== 'production';
const isBuild = process.env.BUILD === 'true';

const PATH_SOURCE = path.resolve(__dirname, './src');
const PATH_DEST = path.resolve(__dirname, './dest');

function getJSLoader() {
    return {
        test: /(\.jsx?)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        query: {
            presets: ["@babel/preset-env"]
        }
    };
}

function getTSLoader() {
    return {
        test: /(\.tsx?)$/,
        use: [
            {
                loader: 'awesome-typescript-loader',
                options: {
                    // silent: true,
                    configFile: path.resolve(__dirname, 'tsconfig.json'),
                    compilerOptions: {
                        module: 'esnext',
                        target: 'es5',
                        noEmitHelpers: true,
                        importHelpers: true
                    }
                }
            },
        ],
    };
}

function getDefinePlugin() {
    return new webpack.DefinePlugin({
        __NODE_ENV__: JSON.stringify(process.env.NODE_ENV || 'development')
    });
}

const serverConfig = {
    resolve: {
        extensions: [".ts", ".js", ".json"],
        modules: [
            PATH_SOURCE,
            path.resolve(process.cwd(), './node_modules')
        ],
        alias: {
            routes: path.resolve(process.cwd(), 'src/routes'),
            config: path.resolve(process.cwd(), 'src/config'),
            common: path.resolve(process.cwd(), 'src/common'),
            resources: path.resolve(process.cwd(), 'resources'),
        }
    },
    module: {
        rules: [
            getJSLoader(),
            getTSLoader()
        ]
    },
    devServer: {
        compress: true,
        historyApiFallback: true,
        stats: {
            children: false,
            chunks: false,
        },
        overlay: {
            warnings: true,
            errors: true
        }
    },

    mode: isDev ? 'development' : 'production',
    stats: {
        children: false,
        chunks: false,
    },
    entry: {
        server: './src/server.ts'
    },
    target: 'node',
    output: {
        path: path.resolve(PATH_DEST),
        filename: '[name].js',
        publicPath: '/'
    },
    plugins: [
        getDefinePlugin(),
        new webpack.NamedModulesPlugin(),
        isDev ? noop : new webpack.optimize.ModuleConcatenationPlugin()
    ],
};

module.exports = serverConfig;

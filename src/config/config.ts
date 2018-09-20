import path from 'path';
import { ConfigRegistry } from './config-registry';
import { ConsoleColor } from 'common/console';

const config = new ConfigRegistry<ApplicationConfig>();
const rootPath = process.cwd();
const configPath = path.resolve(rootPath, './config/');

config.loadYmlFile(path.resolve(configPath, 'app.yml'));
config.loadYmlFile(path.resolve(configPath, 'database.yml'));
config.loadYmlFile(path.resolve(configPath, 'tracker.yml'));
config.loadYmlFile(path.resolve(configPath, 'firebase.yml'));

// Loading .env.yml file from root repository
try {
    const envConfig = path.resolve(rootPath, '.env.yml');
    config.loadYmlFile(envConfig);
} catch (error) {
    console.warn(`${ConsoleColor.FgYellow}  Provide .env.yml file!  ${ConsoleColor.Reset}`);
}


export { ConfigRegistry, config };
export default config;
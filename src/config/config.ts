import path from 'path';
import logger from 'common/logger';
import { ConfigRegistry } from './config-registry';

const config = new ConfigRegistry<ApplicationConfig>();
const rootPath = process.cwd();
const configPath = path.resolve(rootPath, './config/');

config.loadYmlFile(path.resolve(configPath, 'app.yml'));
config.loadYmlFile(path.resolve(configPath, 'database.yml'));
config.loadYmlFile(path.resolve(configPath, 'tracker.yml'));
config.loadYmlFile(path.resolve(configPath, 'intercom.yml'));
config.loadYmlFile(path.resolve(configPath, 'firebase.yml'));

// Loading .env.yml file from root repository
try {
    const envConfig = path.resolve(rootPath, '.env.yml');
    config.loadYmlFile(envConfig);
} catch (error) {
    logger.warn(`Provide .env.yml file!`);
}


export { ConfigRegistry, config };
export default config;

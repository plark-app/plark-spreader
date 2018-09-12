import path from 'path';
import { ConfigRegistry } from './config-registry';

const config = new ConfigRegistry<ApplicationConfig>();
const rootPath = process.cwd();
const configPath = path.resolve(rootPath, './config/');

config.loadYmlFile(path.resolve(configPath, 'app.yml'));
config.loadYmlFile(path.resolve(configPath, 'database.yml'));

// Loading .env.yml file from root repository
config.loadYmlFile(path.resolve(rootPath, '.env.yml'));


export { ConfigRegistry, config };
export default config;
import fs from 'fs';
import { get } from 'lodash';
import yaml  from 'js-yaml';
import deepAssign from 'deep-assign';

export class ConfigRegistry<T extends object = object> {
    protected configData: T = {} as T;

    public get<V = ConfigValue>(key: string, defaultValue?: any): V | undefined {
        return get(this.configData, key, defaultValue) as V;
    }

    public set<T = ConfigValue>(key: string, value: T): void {
        this.merge({ [key]: value });
    }

    public merge(newValues: any): void {
        this.configData = deepAssign({}, this.configData, newValues);
    }

    public loadYmlFile(filePath: string): void {
        try {
            const configValue = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
            this.merge(configValue);
        } catch (error) {
            console.error(error);
        }
    }
}

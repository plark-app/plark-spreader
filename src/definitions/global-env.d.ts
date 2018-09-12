declare global {
    type ConfigValue = object | string | number | null | undefined;

    type AppConfigUnit = {
        host: string;
        port: number;
        secure: boolean;
    };

    type DatabaseConfigUnit = {
        dialect: 'mysql'|'sqlite'|'postgres'|'mssql';
        username: string;
        password: string;
        host: string;
        port: string;
        database: string;
    };

    type ConfigUnits = Record<string, ConfigValue> | AppConfigUnit | DatabaseConfigUnit;
    type ApplicationConfig = Record<string, ConfigUnits>;

    type AnyFunc = (...args: any[]) => any;
}

export {};

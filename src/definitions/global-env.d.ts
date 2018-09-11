declare global {
    type ConfigValue = object | string | number | null | undefined;

    type AppConfigUnit = {
        host: string;
        port: number;
        secure: boolean;
    };

    type ConfigUnits = Record<string, ConfigValue> | AppConfigUnit;
    type ApplicationConfig = Record<string, ConfigUnits>;

    type AnyFunc = (...args: any[]) => any;
}

export {};

import { ServiceAccount } from 'firebase-admin';

declare global {
    type ConfigValue = object | string | number | null | undefined;

    type AppConfigUnit = {
        host: string;
        port: number;
        secure: boolean;
    };

    type DatabaseConfigUnit = {
        dialect: 'mysql' | 'sqlite' | 'postgres' | 'mssql';
        username: string;
        password: string;
        host: string;
        port: number;
        database: string;
    };

    type TrackerConfigUnit = {
        tracker: {
            [coin: string]: Tracker.TrackerParams;
        }
    };

    type FirebaseAdminCert = ServiceAccount & {
        [key: string]: string;
    };

    type FirebaseConfigUnit = {
        admin_cert: FirebaseAdminCert
    };

    type ConfigUnits =
        Record<string, ConfigValue>
        | AppConfigUnit
        | DatabaseConfigUnit
        | TrackerConfigUnit
        | FirebaseConfigUnit;

    type ApplicationConfig = Record<string, ConfigUnits>;

    type AnyFunc = (...args: any[]) => any;

    declare namespace Tracker {
        type TrackerParams = {
            type: 'insight' | 'infura';
            apiUrl: string;
            webSocket?: string;
        };
    }
}

export {};

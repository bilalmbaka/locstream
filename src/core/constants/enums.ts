export enum UserRole {
    user = 'user',
    moderator = 'moderator',
    admin = 'admin',
}

export enum Enviroments {
    dev = 'dev',
    staging = 'staging',
    production = 'production',
}

export class Enviroment {
    private static currentEnviroment = process.env.ENVIROMENT;

    static get isDev(): Boolean {
        return this.currentEnviroment == Enviroments.dev;
    }

    static get isStaging(): Boolean {
        return this.currentEnviroment == Enviroments.staging;
    }

    static get isProduction(): Boolean {
        return this.currentEnviroment == Enviroments.production;
    }
}

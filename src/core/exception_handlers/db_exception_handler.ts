import { EntityNotFoundError, QueryFailedError } from 'typeorm';

export class DBException extends Error {
    errorMessage = 'Database exception has occurred';

    constructor(errorMessage: string, error: Object) {
        super();
        this.errorMessage = errorMessage;
    }
}

export class DBExceptionHandler {
    static handleException(error: any): Object {
        if (error instanceof QueryFailedError) {
            const cast = error as QueryFailedError;

            return new DBException(cast.message, cast);
        }

        if (error instanceof EntityNotFoundError) {
            const cast = error as EntityNotFoundError;

            return new DBException(cast.message, cast);
        }

        return error;
    }
}

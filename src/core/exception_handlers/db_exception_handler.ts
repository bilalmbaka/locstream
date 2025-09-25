import { QueryFailedError } from 'typeorm';

export class DBException extends Error {
    errorMessage = 'Database exception has occurred';

    constructor(errorMessage: string, error: Object) {
        super();
        this.errorMessage = errorMessage;
    }
}

export class DBExceptionHandler {
    static handleException(error: Object): Object {
        if (error instanceof QueryFailedError) {
            const cast = error as QueryFailedError;

            console.log('Cast ', cast);

            return new DBException(cast.message, cast);
        }

        return error;
    }
}

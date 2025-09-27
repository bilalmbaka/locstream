export class StorageException implements Error {
    name: string;
    message: string;
    error: unknown;
    stack?: string;

    constructor(error: Error, message?: string) {
        this.name = 'Could not upload file';
        this.message = message ?? 'Could not upload file';
        this.stack = error.stack;
        this.error = error;
    }
}

export class StoragExceptionHanler {
    static handleException(error: unknown) {
        throw new StorageException(error as Error, 'Could not upload file');
    }
}

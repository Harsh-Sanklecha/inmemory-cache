
class Logger {

    public info(information: string) {
        console.log(`INFO: <--- ${information} --->`);
    }

    public error(error: string) {
        console.log(`ERROR: <--- ${error} --->`);
    }
}

export const logger = new Logger();
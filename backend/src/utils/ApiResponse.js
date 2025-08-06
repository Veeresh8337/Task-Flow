class ApiResponse {
    constructor(statusCode, data = null, message = "Success", errors = [], stack = "") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode< 400; // Assuming status codes below 400 are successful
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

    }
}
export {ApiResponse};
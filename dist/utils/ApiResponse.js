export class ApiResponse {
    constructor(statusCode, data, message = "Success response") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.statusCode = statusCode,
            this.success = statusCode < 400; // for error use code > 400
        this.message = message;
        this.data = data;
    }
}

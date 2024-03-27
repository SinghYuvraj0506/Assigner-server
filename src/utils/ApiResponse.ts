
export class ApiResponse{
    public success:boolean

    constructor(
        public statusCode:number,
        public data: any,
        public message:string = "Success response",
    ){
        this.statusCode = statusCode,
        this.success = statusCode < 400             // for error use code > 400
        this.message = message
        this.data = data
    }
}
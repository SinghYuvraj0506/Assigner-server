
export class ApiError extends Error{
    public success: boolean; 
    public data: null;

    constructor(
        public statusCode:number,
        message : string = "Something went wrong",
        public errors: Error[] = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.errors = errors
        this.success = false
        this.data = null
        
        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}

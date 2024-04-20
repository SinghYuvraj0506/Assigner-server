// Higher order function 
// method-1 for asyn handler ------
const asyncHandler = (requestHandler) => (req, res, next) => (Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err)));
// method 2
// const asyncHandler = (requestHandler) = async (req,res,next) => { 
//     try {
//         await requestHandler(req,res,next)
//     } catch (error) {
//         next(err)
//     }
// }
export default asyncHandler;

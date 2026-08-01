// const asyncHandler = () => { }


// export { asyncHandler }


const asyncHandler = (fn) => async(error,req,res,next) => {
    try{
        await fn(req,res,next)
    }catch(error){
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

export { asyncHandler }
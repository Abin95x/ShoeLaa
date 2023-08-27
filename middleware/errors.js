const errorMiddleware = (error , req , res , next) => {
  console.log(error.message);
  res.render("500")
}

module.exports = errorMiddleware
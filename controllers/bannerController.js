const Banner = require("../models/bannerModel")
const fs = require("fs")
const path = require("path")

const addBannerLoad = async(req,res,next)=>{
    try{
        res.render("bannerAdd")
        
    }catch(error){
        next(error)
    }
}


const bannerList = async(req,res,next)=>{
    try{
        const bannerData = await Banner.find({})
        
        res.render("bannerList",{bannerData})

    }catch(error){
        next(error)
    }
}


const addBanner = async(req,res,next)=>{
    try{
        const {title,discription} = req.body
        // const title = req.body.title
        // const discription = req.body.discription

       
        let image = []
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                image.push(req.files[i].filename);
            }
        }

        const banner = new Banner({
            title:title,
            discription:discription,
            image:image
        })
        await banner.save();
        res.redirect("/admin/bannerList");
        
    }catch(error){
        next(error)
    }
    
}
const bannerEditLoad = async (req, res, next) => {
    try {
        const id = req.params.id; 

        const banner = await Banner.findById(id); 

        res.render("bannerEdit", { banner });

    } catch (error) {
        next(error);
    }
};

const bannerEdit = async (req, res, next) => {
    try {
      const { id, title, discription } = req.body;
  

      const existingBanner = await Banner.findById(id)
      let image = [];
      if(existingBanner && existingBanner.image && existingBanner.image.length>0 ){
        image = existingBanner.image
      }
       // Declare and initialize the 'image' variable as an empty array
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          image.push(req.files[i].filename);
        }
      }
      await Banner.updateOne(
        { _id: id },
        {
          $set: {
            title: title,
            discription: discription,
            image: image,
          },
        }
      );
      res.redirect("/admin/bannerList");
    } catch (error) {
      next(error);
    //   res.render("500");
    }
  };


  const deleteBannerImage = async (req, res ,next) => {
    try {
    
      const { image, id } = req.body;
      
      fs.unlink(path.join(__dirname, "../public/product", image), () => {});
      const deleted = await Banner.updateOne(
        { _id: id },
        { $pull: { image: image } }
      );
      res.send({ success: true });
    
    } catch (error) {
      next(error);
      res.status(500).send({ success: false, error: error.message });
    }
  };
  const unlistBanner = async (req, res ,next) => {
    try {
      const id = req.query.id;
    
      const banner = await Banner.findById({ _id: id });
      if (banner.status === true) {
        await Banner.updateOne({ _id: id }, { $set: { status: false } });
        res.redirect("/admin/bannerList");
      } else {
        await Banner.updateOne({ _id: id }, { $set: { status: true } });
        res.redirect("/admin/bannerList");
      }
    } catch (error) {
      next(error);
     
    }
  };

  





module.exports = {
    addBannerLoad,
    addBanner,
    bannerList,
    bannerEditLoad,
    bannerEdit,
    deleteBannerImage,
    unlistBanner,
    
}
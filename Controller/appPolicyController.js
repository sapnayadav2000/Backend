const AppPolicy = require("../Model/appPolicy");

exports.createAppPolicy = async (req, res) => {
  try {
    const {
      about,
 
      aboutTitle,

      termsAndCondition,

      termsAndConditionTitle,

      privacyPolicy,

      privacyPolicyTitle,
 
      status,
    } = req.body;

    const newPolicy = new AppPolicy({
      about,

      aboutTitle,

      termsAndCondition,
  
      termsAndConditionTitle,
  
      privacyPolicy,
 
      privacyPolicyTitle,
 
      status: status || "Active",
    });

    await newPolicy.save();

    res.status(201).json({
      status: true,
      message: "App Policy created successfully",
      data: newPolicy,
    });
  } catch (error) {
    console.error("Error creating App Policy:", error);
    res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getAppPolicy = async (req, res) => {
  try {
    const appPolicy = await AppPolicy.findOne(); // Get the first document

    if (!appPolicy) {
      return res
        .status(404)
        .json({ status: false, message: "No App Policy found" });
    }

    let responseData = {};

    if (req.query.data === "privacyPolicy") {
      responseData = {
        English: appPolicy.privacyPolicy || "No data",
        Title: appPolicy.privacyPolicyTitle || "No title",
     
      };
    } else if (req.query.data === "termsAndCondition") {
      responseData = {
        English: appPolicy.termsAndCondition || "No data",
        Title: appPolicy.termsAndConditionTitle || "No title",
     
      };
    } else if (req.query.data === "about") {
      responseData = {
        English: appPolicy.about || "No data",
        Title: appPolicy.aboutTitle || "No title",
      
      };
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid query parameter" });
    }

    res.status(200).json({
      status: true,
      message: "App Policy fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching App Policy:", error);
    res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.updateAppPolicy = async (req, res) => {
  try {
    const {
      about,

      aboutTitle,
   
      termsAndCondition,

      termsAndConditionTitle,
 
      privacyPolicy,
 
      privacyPolicyTitle,

      status,
    } = req.body;

    const updatedPolicy = await AppPolicy.findOneAndUpdate(
      {},
      {
        about,
  
        aboutTitle,
    
        termsAndCondition,
  
        termsAndConditionTitle,
    
        privacyPolicy,
     
        privacyPolicyTitle,
    
        status,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: true,
      message: "App Policy updated successfully",
      data: updatedPolicy,
    });
  } catch (error) {
    console.error("Error updating App Policy:", error);
    res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

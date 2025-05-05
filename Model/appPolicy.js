const  mongoose = require('mongoose');


appPolicySchema = new mongoose.Schema({
    about:{
        type:String
    },
    aboutHindi: 
    { type: String

     }, 
    aboutTitle:{
        type:String
    },
    aboutTitleHindi:{
        type:String
    },
    termsAndCondition:{
        type:String
    },
    termsAndConditionHindi:{
        type:String
    },
    termsAndConditionTitle:{
        type:String
    },
    termsAndConditionTitleHindi:{
        type:String
    },
    privacyPolicy:{
        type:String,
    },
    privacyPolicyHindi:{
        type:String,
    },
    privacyPolicyTitle:{
        type:String
    },
    privacyPolicyTitleHindi:{
        type:String
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
      },
   
},
  
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


const AppPolicy = mongoose.model('AppPolicy',appPolicySchema);

module.exports = AppPolicy;
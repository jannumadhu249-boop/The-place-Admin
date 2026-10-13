const base_url = "http://16.113.133.178:3000/"

export  const URLS = {

    GoogleMapApiKey : "AIzaSyAVIXB_FMMGCxgGDjhnA27qNDUl8LPEuus",

    Base: base_url,
    ImageUrl: base_url,


    //Authentication
    Login: base_url + "v1/place/admin/auth/authLogin",
    GetProfile: base_url + "v1/place/admin/auth/getprofile",
    UpdateProfile: base_url + "v1/place/admin/auth/updateAdminProfile",
    UpdateProfilePic: base_url + "v1/place/admin/auth/editprofilepic",
    ChangePassword: base_url + "v1/place/admin/auth/changeAdminPassword",
    ForgotPasswordSendOtp: base_url + "v1/place/admin/auth/generateForgotPasswordOTP",
    ForgotPasswordVerifyOtp: base_url + "v1/place/admin/auth/compareForgotPasswordOTP",
    ForgotPasswordResetPassword: base_url + "v1/place/admin/auth/resetPassword",

    //Coupons
    GetCoupons: base_url + "v1/place/admin/coupon/getAll",
    CreateCoupons: base_url + "v1/place/admin/coupon/add",
    GetByIdCoupons: base_url + "v1/place/admin/coupon/getbyid",
    UpdateCoupons: base_url + "v1/place/admin/coupon/edit/",
    DeleteCoupons: base_url + "v1/place/admin/coupon/delete/",

    //Banners
    GetBanners: base_url + "v1/place/admin/banner/getAll",
    CreateBanners: base_url + "v1/place/admin/banner/add",
    UpdateBanners: base_url + "v1/place/admin/banner/edit/",
    DeleteBanners: base_url + "v1/place/admin/banner/delete/",

    //Zone
    GetZones: base_url + "v1/place/admin/zone/getall",
    GetSearchQuery: base_url + "v1/place/admin/coupon/getAll?searchQuery=",
    CreateZone: base_url + "v1/place/admin/zone/add",
    UpdateZone: base_url + "v1/place/admin/zone/edit/",
    DeleteZone: base_url + "v1/place/admin/zone/delete/",

    //Categories
    GetCategories: base_url + "v1/place/admin/category/getAllCategories",
    CreateCategories: base_url + "v1/place/admin/category/addCategory",
    UpdateCategories: base_url + "v1/place/admin/category/updateCategory/",
    DeleteCategories: base_url + "v1/place/admin/category/deleteCategory/",

    //Sub-Categories
    GetSubCategories: base_url + "v1/place/admin/subcategory/getAllSubcategories",
    CreateSubCategories: base_url + "v1/place/admin/subcategory/addSubcategory",
    UpdateSubCategories: base_url + "v1/place/admin/subcategory/updateSubcategory/",
    GetByIdSubCategories: base_url + "v1/place/admin/subcategory/subcategorysbyCategoryId",
    DeleteSubCategories: base_url + "v1/place/admin/subcategory/deleteSubcategory/",

    //Departments
    GetDepartments: base_url + "v1/place/admin/department/getall-departments",
    CreateDepartment: base_url + "v1/place/admin/department/adddepartment",
    UpdateDepartment: base_url + "v1/place/admin/department/updatedepartment/",
    DeleteDepartment: base_url + "v1/place/admin/department/deletedepartment/",

    //FAQs
    GetFaqs: base_url + "v1/place/admin/faq/getallfaqs",
    CreateFaq: base_url + "v1/place/admin/faq/addfaq",
    UpdateFaq: base_url + "v1/place/admin/faq/editfaq/",
    DeleteFaq: base_url + "v1/place/admin/faq/deletefaq/",

    //About Us
    GetAboutUs: base_url + "v1/place/admin/aboutus/get",
    UpdateAboutUs: base_url + "v1/place/admin/aboutus/update",

    //Contact Us
    GetContactUs: base_url + "v1/place/admin/contactUs/get",
    UpdateContactUs: base_url + "v1/place/admin/contactUs/update",

    //Policies
    GetPolicies: base_url + "v1/place/admin/policy/get",
    UpdateTerms: base_url + "v1/place/admin/policy/updatetermsAndCondition",
    UpdateRefundPolicy: base_url + "v1/place/admin/policy/updaterefundPolicy",
    UpdatePrivacyPolicy: base_url + "v1/place/admin/policy/updateprivacyPolicy",

}
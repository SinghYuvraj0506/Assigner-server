import { CookieOptions } from "express";

export const DB_NAME = "aalas";

const cookieALlOptions: () => CookieOptions = () => {
  if (process.env.NODE_ENV === "development"){
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      domain:"localhost"
    };
  }
  
  else{
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain:"livetesting.tech"
    };
  }
}

export const cookieOption = cookieALlOptions()


export const loginMethodsEnum = {
  email: "email",
  google: "google",
};

export const AvailableLoginMethods = Object.keys(loginMethodsEnum);

export const fileTypeEnum = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

export const usageEnum = ["assignments"];

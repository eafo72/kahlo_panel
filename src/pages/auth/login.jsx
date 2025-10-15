import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import Social from "./common/social";
import useDarkMode from "@/hooks/useDarkMode";
import { ToastContainer } from "react-toastify";

// image import
import LogoWhite from "@/assets/images/logo/logo-small.png";
import LogoBlack from "@/assets/images/logo/logo-small-black.png";
import Illustration from "@/assets/images/logo/logo-full.png";
import IllustrationBlack from "@/assets/images/logo/logo-full-black.png";

const login = () => {
  const [isDark] = useDarkMode();
  return (
    <>
      <ToastContainer />
      <div className="loginwrapper">
        <div className="lg-inner-column">
          <div className="left-column relative z-[1]">

             <div align="center" style={{marginTop:"40vh"}}>
              <img
                src={isDark ? Illustration : IllustrationBlack}
                alt=""
                className="object-contain"
              />
            </div>

          </div>
          <div className="right-column relative">
            <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
              <div className="auth-box h-full flex flex-col justify-center">
                <div className="mobile-logo text-center mb-6 lg:hidden block">
                  <Link to="/">
                    <img
                      src={isDark ? LogoWhite : LogoBlack}
                      alt=""
                      className="mx-auto"
                    />
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-4">
                  <h4 className="font-medium">Sign in</h4>
                  <div className="text-slate-500 text-base">
                    {/*}LSign in to your account to start using Dashcode{*/}
                  </div>
                </div>
                <LoginForm />
              </div>
              <div className="auth-footer text-center">
                {/*}Copyright 2021, Dashcode All Rights Reserved.{*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default login;

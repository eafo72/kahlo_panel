import React from "react";
import { Link } from "react-router-dom";

import ErrorImage from "@/assets/images/all-img/404-2.svg";
function Error() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center py-20 bg-slate-900">
      <img src={ErrorImage} alt="" />
      <div className="max-w-[546px] mx-auto w-full mt-12">
        <h4 className="text-white text-[40px] leading-[50px] mb-4">
          Página no encontrada
        </h4>
        <div className="text-white text-base font-normal mb-10">
          La página que esta buscando talvez fue removida, cambio de nombre o no está disponible por el momento.
        </div>
      </div>
      <div className="max-w-[300px] mx-auto w-full">
        <Link
          to="/dashboard"
          className="btn bg-white text-black-500 hover:bg-opacity-75 transition-all duration-150 block text-center"
        >
          Ir a Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Error;

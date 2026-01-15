import { useState, createContext } from 'react'
import clienteAxios from '../../configs/axios'
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState()
  const [authStatus, setAuthStatus] = useState(false)

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    event.preventDefault()
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const verifyingToken = async () => {
    const token = localStorage.getItem('token')

    if (token) {
      clienteAxios.defaults.headers.common['x-auth-token'] = token
      try {
        const res = token && (await clienteAxios.post('/usuario/verificar'))
        //console.log(res.data);

        if (res.data) {
          setUser(res.data);
          setAuthStatus(true)
        } else {
          toast.error(res.data.msg, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            theme: "dark",
          });
          localStorage.removeItem("token"); // Eliminar token si es inválido
          navigate("/");
        }
      } catch (error) {
        delete clienteAxios.defaults.headers.common['x-auth-token']
        console.log(error);
        toast.error(error.response.data.msg, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "dark",
        });
      }
    } else {
      delete clienteAxios.defaults.headers.common['x-auth-token']
      console.log('No existe token')
      navigate("/");
    }
  }

  const loginUser = async (dataForm) => {
    try {
      const res = await clienteAxios.post('/usuario/login', dataForm)
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        setAuthStatus(true)

        const token = res.data.token

        clienteAxios.defaults.headers.common['x-auth-token'] = token
        try {
          const res = token && (await clienteAxios.post('/usuario/verificar'))
          //console.log(res.data);

          if (res.data[0]) {
            if (res.data[0].isAdmin == 1 || res.data[0].isSuperAdmin == 1 || res.data[0].isInvestor == 1) {
              window.location.href = "/dashboard";
            } else if (res.data[0].isGuia == 1 || res.data[0].isPartner == 1) {
              window.location.href = "/ventas";
            } else if (res.data[0].isSpecialist == 1) {
              window.location.href = "/colaboradores";
            } else {
              toast.error("Lo sentimos el acceso solo es para administradores", {
                position: "top-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
                theme: "dark",
              });
            }
          }


        } catch (error) {
          delete clienteAxios.defaults.headers.common['x-auth-token']
          console.log(error);
          toast.error(error.response.data.msg, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            theme: "dark",
          });
        }
      } else {
        toast.error(res.data.msg, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "dark",
        });
      }

    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
      });

    }
  }

  const SignOut = () => {
    localStorage.removeItem('token')
    setUser(null)
    setAuthStatus(false)
  }

  const data = { loginUser, handleChange, verifyingToken, SignOut, formData, user, authStatus }
  //console.log('CONTEXTO USUARIO', data)
  return <UserContext.Provider value={data}>{children}</UserContext.Provider>
}

import React, { useEffect, useState, useMemo, useContext } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../table/react-tables/GlobalFilter";

import { useNavigate } from "react-router-dom";
import clienteAxios from '../../configs/axios';
import { UserContext } from "../../pages/context/userContext";





const Guias = () => {
  const COLUMNS = [
    {
      Header: "Id",
      accessor: "id",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Nombres",
      accessor: "nombres",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Apellidos",
      accessor: "apellidos",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Correo",
      accessor: "correo",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: (row) => {
        return (
          <span className="block w-full">
            <span
              className={` inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
                row?.cell?.value === 1
                  ? "text-success-500 bg-success-500"
                  : ""
              } 
              ${
                row?.cell?.value === 0
                  ? "text-danger-500 bg-danger-500"
                  : ""
              }
              
               `}
            >
              {row?.cell?.value === 1 ? "Activo":"Desactivado"}
            </span>
          </span>
        );
      },
    },
    {
      Header: "Empresa",
      accessor: "empresa",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "action",
      accessor: "action",
      Cell: (row) => {
        return (
          <div>
            <Dropdown
              classMenuItems="right-0 w-[140px] top-[110%] "
              label={
                <span className="text-xl text-center block w-full">
                  <Icon icon="heroicons-outline:dots-vertical" />
                </span>
              }
            >
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {actions.map((item, i) => (
                  <Menu.Item key={i}>
                    <div
                      onClick={() => item.ActionToDo(row.row.original.id)}
                      className={`
                  
                    ${
                      item.name === "Borrar"
                        ? "bg-danger-500 text-danger-500 bg-opacity-30   hover:bg-opacity-100 hover:text-white"
                        : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50"
                    }
                     w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm  last:mb-0 cursor-pointer 
                     first:rounded-t last:rounded-b flex  space-x-2 items-center rtl:space-x-reverse `}
                    >
                      <span className="text-base">
                        <Icon icon={item.icon} />
                      </span>
                      <span>{item.name}</span>
                    </div>
                  </Menu.Item>
                ))}
              </div>
            </Dropdown>
          </div>
        );
      },
    },
  ];
  
  const actions = [
    
    {
      name: "Editar",
      icon: "heroicons:pencil-square",
      ActionToDo: (id) => {
        //console.log("Editar"+id);
        localStorage.setItem("EditGuia",id);
        navigate("/guias/editar");
      },
    },
    {
      name: "Borrar",
      icon: "heroicons-outline:trash",
      ActionToDo: (id) => {
        //console.log("Borrar"+id);
        localStorage.setItem("DeleteGuia",id);
        navigate("/guias/borrar");
      },
    },
  ];
  
  const columns = useMemo(() => COLUMNS, []);

  const [datos, setDatos] = useState([]);
  
  const userCtx = useContext(UserContext);
  const { user, authStatus, verifyingToken } = userCtx;
  
  const navigate = useNavigate();

  const getGuias = async (tipoUsuario,idempresa) => {
    //console.log("TipoUsuario:"+tipoUsuario);
    //tipoUsuario == 1 SuperAdmin
    //tipoUsuario == 2 Administrador

    if(parseInt(tipoUsuario) == 1){
      try {
        const res = await clienteAxios.get(`/admin/guia/guias`);
        console.log(res.data);
        setDatos(res.data);
      } catch (error) {
        console.log(error)
      }
    }else{
      try {
        const res = await clienteAxios.get(`/admin/guia/obtenerByEmpresa/${idempresa}`);
        console.log(res.data);
        setDatos(res.data);
      } catch (error) {
        console.log(error)
      } 
    }  
  }
  useEffect(() => {
    verifyingToken();
    //console.log(user);
    if(authStatus === false) {
      //navigate("/");
    }
    if(user && user[0].isSuperAdmin == 1){
      getGuias(1,user[0].empresa_id);
    }
    if(user && user[0].isAdmin == 1){
      getGuias(2,user[0].empresa_id);
    }
    //console.log(datos);
  },[authStatus])

  
  const handleAlta = () => {
    navigate("/guias/alta");
  }
  
  
  const data = useMemo(() => datos, [datos]);

  const tableInstance = useTable(
    {
      columns,
      data,
    },

    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;
  return (
    <>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Guias</h4>
          <button onClick={(e) => handleAlta(e)} className="btn btn-success">Agregar nuevo</button>
          <div>
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
          </div>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden ">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps}
              >
                <thead className=" border-t border-slate-100 dark:border-slate-800">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          scope="col"
                          className=" table-th "
                        >
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                  {...getTableBodyProps}
                >
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return (
                            <td {...cell.getCellProps()} className="table-td">
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className=" flex items-center space-x-3 rtl:space-x-reverse">
            <span className=" flex space-x-2  rtl:space-x-reverse items-center">
              <span className=" text-sm font-medium text-slate-600 dark:text-slate-300">
                Go
              </span>
              <span>
                <input
                  type="number"
                  className=" form-control py-2"
                  defaultValue={pageIndex + 1}
                  onChange={(e) => {
                    const pageNumber = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    gotoPage(pageNumber);
                  }}
                  style={{ width: "50px" }}
                />
              </span>
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page{" "}
              <span>
                {pageIndex + 1} of {pageOptions.length}
              </span>
            </span>
          </div>
          <ul className="flex items-center  space-x-3  rtl:space-x-reverse">
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={` ${
                  !canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <Icon icon="heroicons-outline:chevron-left" />
              </button>
            </li>
            {pageOptions.map((page, pageIdx) => (
              <li key={pageIdx}>
                <button
                  href="#"
                  aria-current="page"
                  className={` ${
                    pageIdx === pageIndex
                      ? "bg-slate-900 dark:bg-slate-600  dark:text-slate-200 text-white font-medium "
                      : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900  font-normal  "
                  }    text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                  onClick={() => gotoPage(pageIdx)}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={` ${
                  !canNextPage ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                <Icon icon="heroicons-outline:chevron-right" />
              </button>
            </li>
          </ul>
        </div>
      </Card>
    </>
  );
};

export default Guias;

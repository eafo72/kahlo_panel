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
import clienteAxios from "../../configs/axios";
import { UserContext } from "../../pages/context/userContext";

const Users = () => {

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
      Header: "Teléfono",
      accessor: "telefono",
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
      Header: "Tipo de Usuario",
      accessor: "tipo_usuario",
      Cell: (row) => {
        const rowData = row.row.original;
        let userType = "";
        
        if (rowData.isClient === 1) {
          userType = "Cliente";
        } else if (rowData.isAdmin === 1) {
          userType = "Administrador";
        } else if (rowData.isOperator === 1) {
          userType = "Tour Operador";
        } else if (rowData.isInvestor === 1) {
          userType = "Inversionista";
        } else if (rowData.isPartner === 1) {
          userType = "Partner";
        } else if (rowData.isGuia === 1) {
          userType = "Colaborador";
        } else if (rowData.isSpecialist === 1) {
          userType = "Especialista";
        } else if (rowData.isEventual === 1) {
          userType = "Eventual";
        }
        return <span>{userType}</span>;
      },
    },
    {
      Header: "status",
      accessor: "status",
      Cell: (row) => {
        return (
          <span className="block w-full">
            <span
              className={` inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${row?.cell?.value === 1 ? "text-success-500 bg-success-500" : ""
                } 
              ${row?.cell?.value === 0 ? "text-danger-500 bg-danger-500" : ""}
              
               `}
            >
              {row?.cell?.value === 1 ? "Activo" : "Desactivado"}
            </span>
          </span>
        );
      },
    },
    {
      Header: "action",
      accessor: "action",
      Cell: (row) => {
        // Function to determine user type
        const getUserType = (rowData) => {
          if (rowData.isAdmin === 1) return "Administrador";
          if (rowData.isOperator === 1) return "Tour Operador";
          if (rowData.isInvestor === 1) return "Inversionista";
          if (rowData.isPartner === 1) return "Partner";
          if (rowData.isGuia === 1) return "Colaborador";
          if (rowData.isSpecialist === 1) return "Especialista";
          if (rowData.isEventual === 1) return "Eventual";
          return "Cliente"; // Default case
        };

        // Get available actions for this user
        const getAvailableActions = (rowData) => {
          const userType = getUserType(rowData);
          const allActions = [
            {
              name: "Editar",
              icon: "heroicons:pencil-square",
              ActionToDo: (id) => {
                localStorage.setItem("EditUser", id);
                navigate("/usuarios/editar");
              },
            },
            {
              name: "Horarios",
              icon: "heroicons:clock",
              ActionToDo: (id, rowData) => {
                localStorage.setItem("HorariosUser", id);
                // Check if user is eventual (isEventual === 1)
                if (rowData.isEventual === 1) {
                  navigate("/usuarios/horarios_eventuales");
                } else {
                  navigate("/usuarios/horarios", { state: { returnTo: "/usuarios" } });
                }
              },
            },
            {
              name: "Desactivar",
              icon: "heroicons-outline:trash",
              ActionToDo: (id) => {
                localStorage.setItem("DeleteUser", id);
                navigate("/usuarios/borrar");
              },
            },
          ];

          // Filter out Horarios for Cliente users
          return allActions.filter(action => {
            if (action.name === "Horarios" && userType === "Cliente") {
              return false;
            }
            return true;
          });
        };

        const availableActions = getAvailableActions(row.row.original);

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
                {availableActions.map((item, i) => (
                  <Menu.Item key={i}>
                    <div
                      onClick={() => item.ActionToDo(row.row.original.id, row.row.original)}
                      className={`
                  
                    ${item.name === "Borrar"
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

  

  const columns = useMemo(() => COLUMNS, []);

  const [datos, setDatos] = useState([]);

  const [showJumpInput, setShowJumpInput] = useState(false);
  const [jumpTarget, setJumpTarget] = useState(null);
  const [jumpValue, setJumpValue] = useState("");

  const userCtx = useContext(UserContext);
  const { authStatus, verifyingToken } = userCtx;

  const navigate = useNavigate();

  const getUsers = async () => {
    try {
      const res = await clienteAxios.get(`/usuario/todos`);
      console.log(res.data);
      setDatos(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    verifyingToken();
    if (authStatus === false) {
      //navigate("/");
    }
    getUsers();
    console.log(datos);
  }, [authStatus]);




  const handleAlta = () => {
    navigate("/usuarios/alta");
  };

  const data = useMemo(() => datos, [datos]);

  const tableInstance = useTable(
    {
      columns,
      data,
    },

    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
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
  useEffect(() => {
    setPageSize(20); // 👈 ahora cada página tendrá 20 registros
  }, [setPageSize]);

  const getVisiblePages = () => {
    const totalPages = pageCount;
    const current = pageIndex;

    const delta = 2;
    const range = [];

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) range.push(i);
      return range;
    }

    range.push(0);

    const start = Math.max(1, current - delta);
    const end = Math.min(totalPages - 2, current + delta);

    if (start > 1) range.push("dots-left");

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < totalPages - 2) range.push("dots-right");

    range.push(totalPages - 1);

    return range;
  };
  return (
    <>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Usuarios</h4>
          <button onClick={(e) => handleAlta(e)} className="btn btn-success">
            Agregar nuevo
          </button>

          <div className="flex items-right">
            <select style={{ maxWidth: "150px", marginRight: "10px" }}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="form-control py-2"
            >
              {[10, 20, 30, 40, 50, 100, 200, 500].map(size => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </select>
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
          </div>
        </div>
        <div></div>
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
          <ul className="flex flex-wrap justify-center gap-2 mt-4 items-center">
            {/* Primera página */}
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => gotoPage(0)}
                disabled={pageIndex === 0}
                title="Primera página"
              >
                <Icon icon="heroicons-outline:chevron-double-left" />
              </button>
            </li>

            {/* Anterior */}
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                title="Anterior"
              >
                <Icon icon="heroicons-outline:chevron-left" />
              </button>
            </li>

            {/* Páginas visibles */}
            {getVisiblePages().map((pageIdx, index) => {

              // cuando son dots
              if (pageIdx === "dots-left" || pageIdx === "dots-right") {
                return (
                  <li key={`${pageIdx}-${index}`} className="relative">
                    {jumpTarget !== pageIdx ? (
                      <button
                        className="text-sm text-slate-500 dark:text-slate-400 px-2 select-none hover:text-slate-900 dark:hover:text-white"
                        onClick={() => setJumpTarget(pageIdx)}
                        title="Ir a página..."
                      >
                        ...
                      </button>
                    ) : (
                      <input
                        type="number"
                        autoFocus
                        value={jumpValue}
                        onChange={(e) => setJumpValue(e.target.value)}
                        onBlur={() => {
                          setJumpTarget(null);
                          setJumpValue("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            let pageNum = Number(jumpValue);

                            if (!pageNum || pageNum < 1) pageNum = 1;
                            if (pageNum > pageCount) pageNum = pageCount;

                            gotoPage(pageNum - 1);

                            setJumpTarget(null);
                            setJumpValue("");
                          }

                          if (e.key === "Escape") {
                            setJumpTarget(null);
                            setJumpValue("");
                          }
                        }}
                        className="form-control py-1 px-2 text-sm"
                        style={{ width: "70px" }}
                        placeholder="Pag"
                      />
                    )}
                  </li>
                );
              }


              // páginas normales
              return (
                <li key={pageIdx}>
                  <button
                    aria-current={pageIdx === pageIndex ? "page" : undefined}
                    className={` ${pageIdx === pageIndex
                      ? "bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium"
                      : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal"
                      } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                    onClick={() => gotoPage(pageIdx)}
                  >
                    {pageIdx + 1}
                  </button>
                </li>
              );
            })}


            {/* Siguiente */}
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => nextPage()}
                disabled={!canNextPage}
                title="Siguiente"
              >
                <Icon icon="heroicons-outline:chevron-right" />
              </button>
            </li>

            {/* Última página */}
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${pageIndex === pageCount - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => gotoPage(pageCount - 1)}
                disabled={pageIndex === pageCount - 1}
                title="Última página"
              >
                <Icon icon="heroicons-outline:chevron-double-right" />
              </button>
            </li>
          </ul>
        </div>
      </Card>
    </>
  );
};

export default Users;

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
import { UserContext } from "../context/userContext";
import Swal from "sweetalert2";

const Ingreso = () => {

  // Función helper para aplicar estilos a SweetAlert2
  const applySweetAlertStyles = () => {
    // Agregar estilos CSS para forzar la visibilidad de los botones
    const style = document.createElement('style');
    style.textContent = `
        .swal2-popup .swal2-actions {
            display: flex !important;
            justify-content: center !important;
            margin-top: 1em !important;
        }
        .swal2-popup .swal2-confirm:not([style*="display: none"]):not(.swal2-hidden) {
            background-color: #10b981 !important;
            color: white !important;
            border: none !important;
            padding: 0.6em 1.5em !important;
            font-size: 1em !important;
            font-weight: 500 !important;
            border-radius: 0.25em !important;
            margin: 0 0.5em !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: inline-block !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
        .swal2-popup .swal2-cancel:not([style*="display: none"]):not(.swal2-hidden) {
            background-color: #ef4444 !important;
            color: white !important;
            border: none !important;
            padding: 0.6em 1.5em !important;
            font-size: 1em !important;
            font-weight: 500 !important;
            border-radius: 0.25em !important;
            margin: 0 0.5em !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: inline-block !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
        .swal2-popup .swal2-deny:not([style*="display: none"]):not(.swal2-hidden) {
            background-color: #ef4444 !important;
            color: white !important;
            border: none !important;
            padding: 0.6em 1.5em !important;
            font-size: 1em !important;
            font-weight: 500 !important;
            border-radius: 0.25em !important;
            margin: 0 0.5em !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: inline-block !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
    `;
    document.head.appendChild(style);
  };

  const COLUMNS = [
    {
      Header: "Id",
      accessor: "id",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Colaborador",
      accessor: "nombre_colaborador",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Id Movimiento",
      accessor: "movimiento_id",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Fecha",
      accessor: "fecha",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Estado",
      accessor: "estado",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Hora Solicitud",
      accessor: "hora_solicitud",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Hora Autorización",
      accessor: "hora_autorizacion",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Autorizado por",
      accessor: "autorizado_por",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Motivo",
      accessor: "motivo",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Usada",
      accessor: "usada",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Vencimiento",
      accessor: "vencimiento",
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
                      onClick={() => item.ActionToDo(row.row.original)}
                      className={`
                      
                      ${item.name === "Autorizar"
                          ? "bg-success-500 text-success-500 bg-opacity-30   hover:bg-opacity-100 hover:text-white"
                          : item.name === "Rechazar"
                          ? "bg-danger-500 text-danger-500 bg-opacity-30   hover:bg-opacity-100 hover:text-white"
                          : item.name === "Perdonar"
                          ? "bg-info-500 text-info-500 bg-opacity-30   hover:bg-opacity-100 hover:text-white"
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

  const userCtx = useContext(UserContext);
  const { user, authStatus, verifyingToken } = userCtx;

  const navigate = useNavigate();

  const actions = [
    {
      name: "Autorizar",
      icon: "heroicons:check-circle",
      ActionToDo: (rowData) => {
        Swal.fire({
          title: "¿Autorizar Ingreso?",
          text: "¿Está seguro que desea autorizar este ingreso?",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#ef4444",
          confirmButtonText: "Sí, autorizar",
          cancelButtonText: "Cancelar",
          didOpen: applySweetAlertStyles
        }).then((result) => {
          if (result.isConfirmed) {
            handleAutorizar(rowData.id);
          }
        });
      },
    },
    {
      name: "Rechazar",
      icon: "heroicons:x-circle",
      ActionToDo: (rowData) => {
        Swal.fire({
          title: "¿Rechazar Ingreso?",
          text: "¿Está seguro que desea rechazar este ingreso?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, rechazar",
          cancelButtonText: "Cancelar",
          input: "textarea",
          inputLabel: "Motivo del rechazo",
          inputPlaceholder: "Por favor, describe el motivo por el cual se rechaza esta autorización...",
          inputValidator: (value) => {
            if (!value || value.trim() === '') {
              return 'Debe proporcionar un motivo para el rechazo';
            }
            return null;
          },
          didOpen: applySweetAlertStyles
        }).then((result) => {
          if (result.isConfirmed) {
            handleRechazar(rowData.id, result.value);
          }
        });
      },
    },
    {
      name: "Perdonar",
      icon: "heroicons:hand-raised",
      ActionToDo: (rowData) => {
        Swal.fire({
          title: "¿Perdonar Ingreso?",
          text: "¿Está seguro que desea perdonar este ingreso?",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, perdonar",
          cancelButtonText: "Cancelar",
          html: `
            <div style="text-align: left; margin: 10px 0; max-width: 400px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500; font-size: 14px;">Motivo:</label>
              <textarea id="motivo-perdonar" class="swal2-textarea" placeholder="Describe el motivo..." style="width: 100%; height: 60px; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; resize: vertical;"></textarea>
              
              <label style="display: block; margin: 10px 0 5px 0; font-weight: 500; font-size: 14px;">Minutos de Retraso:</label>
              <input id="minutos-retraso" type="number" class="swal2-input" placeholder="Ej: 15" min="0" max="999" style="width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
              
              <label style="display: block; margin: 10px 0 5px 0; font-weight: 500; font-size: 14px;">Tipo de Autorización:</label>
              <select id="tipo-autorizacion" class="swal2-select" style="width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
                <option value="">Selecciona una opción...</option>
                <option value="RETARDO_MAYOR">Retardo Mayor</option>
                <option value="ENTRADA_SIN_HORARIO">Entrada Sin Horario</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          `,
          preConfirm: () => {
            const motivo = document.getElementById('motivo-perdonar').value;
            const minutosRetraso = document.getElementById('minutos-retraso').value;
            const tipoAutorizacion = document.getElementById('tipo-autorizacion').value;
            
            if (!motivo || motivo.trim() === '') {
              Swal.showValidationMessage('Debe proporcionar un motivo');
              return false;
            }
            
            if (!minutosRetraso || minutosRetraso < 0) {
              Swal.showValidationMessage('Debe proporcionar los minutos de retraso');
              return false;
            }
            
            if (!tipoAutorizacion) {
              Swal.showValidationMessage('Debe seleccionar un tipo de autorización');
              return false;
            }
            
            return { motivo, minutosRetraso: parseInt(minutosRetraso), tipoAutorizacion };
          },
          didOpen: applySweetAlertStyles
        }).then((result) => {
          if (result.isConfirmed) {
            handlePerdonar(rowData, result.value.motivo, result.value.minutosRetraso, result.value.tipoAutorizacion);
          }
        });
      },
    },
  ];

  const handleAutorizar = async (autorizacionId) => {
    try {
      // Obtener el usuario actualizado del contexto
      const currentUser = await verifyingToken();
      
      if (!currentUser || !currentUser[0]) {
        throw new Error('Usuario no autenticado');
      }
      
      const adminId = currentUser[0].id; // ID del usuario logueado
      const res = await clienteAxios.post('/venta/autorizaciones/aprobar', {
        autorizacion_id: autorizacionId,
        admin_id: adminId
      });
      
      console.log(res.data);
      // Recargar los datos después de autorizar
      getInfo();
      
      // Mostrar mensaje de éxito con SweetAlert2
      Swal.fire({
        icon: "success",
        title: "¡Autorización Aprobada!",
        text: "La autorización ha sido aprobada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
        didOpen: applySweetAlertStyles
      });
    } catch (error) {
      console.log(error);
      // Mostrar mensaje de error con SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al autorizar: " + (error.response?.data?.msg || error.message),
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Entendido",
        didOpen: applySweetAlertStyles
      });
    }
  };

  const handlePerdonar = async (rowData, motivo, minutosRetraso, tipoAutorizacion) => {
    try {
      // Obtener el usuario actualizado del contexto
      const currentUser = await verifyingToken();
      
      if (!currentUser || !currentUser[0]) {
        throw new Error('Usuario no autenticado');
      }
      
      const adminId = currentUser[0].id; // ID del usuario logueado
      
      // Extraer los datos necesarios de rowData
      const data = {
        id_usuario_colaborador: rowData.id_usuario,
        id_usuario_admin: adminId,
        fecha: rowData.fecha,
        minutos_retraso: minutosRetraso,
        motivo: motivo,
        tipo_autorizacion: tipoAutorizacion
      };
      
      console.log('Datos enviados a perdonar:', data);
      
      const res = await clienteAxios.post('/venta/autorizaciones/perdonar', data);
      
      console.log(res.data);
      // Recargar los datos después de perdonar
      getInfo();
      
      // Mostrar mensaje de éxito con SweetAlert2
      Swal.fire({
        icon: "success",
        title: "¡Autorización Perdonada!",
        text: "La autorización ha sido perdonada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
        didOpen: applySweetAlertStyles
      });
    } catch (error) {
      console.log(error);
      // Mostrar mensaje de error con SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al perdonar: " + (error.response?.data?.msg || error.message),
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Entendido",
        didOpen: applySweetAlertStyles
      });
    }
  };

  const handleRechazar = async (autorizacionId, motivo) => {
    try {
      // Obtener el usuario actualizado del contexto
      const currentUser = await verifyingToken();
      
      if (!currentUser || !currentUser[0]) {
        throw new Error('Usuario no autenticado');
      }
      
      const adminId = currentUser[0].id; // ID del usuario logueado
      const res = await clienteAxios.post('/venta/autorizaciones/rechazar', {
        autorizacion_id: autorizacionId,
        admin_id: adminId,
        motivo: motivo
      });
      
      console.log(res.data);
      // Recargar los datos después de rechazar
      getInfo();
      
      // Mostrar mensaje de éxito con SweetAlert2
      Swal.fire({
        icon: "success",
        title: "¡Autorización Rechazada!",
        text: "La autorización ha sido rechazada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
        didOpen: applySweetAlertStyles
      });
    } catch (error) {
      console.log(error);
      // Mostrar mensaje de error con SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al rechazar: " + (error.response?.data?.msg || error.message),
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Entendido",
        didOpen: applySweetAlertStyles
      });
    }
  };

  const getInfo = async () => {
    try {
      const res = await clienteAxios.get(`/venta/autorizaciones/ingreso`);
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
    getInfo();
    console.log(datos);
  }, [authStatus]);


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
  return (
    <>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Ingreso</h4>
         
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
          <ul className="flex flex-wrap justify-center gap-2 mt-4">
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={` ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
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
                  className={` ${pageIdx === pageIndex
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
                className={` ${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
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

export default Ingreso;

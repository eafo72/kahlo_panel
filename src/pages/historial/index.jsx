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

import { downloadExcel } from "react-export-table-to-excel";


const Historial = () => {
  const COLUMNS = [
    {
      Header: "Tour",
      accessor: "nombre_del_tour",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Id Reservación",
      accessor: "id_reservacion",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Nombre Visitante",
      accessor: "nombre_visitante",
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
      Header: "No.Boletos",
      accessor: "no_boletos",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
      Footer: (info) => {
        const total = info.rows.reduce((sum, row) => sum + Number(row.values.no_boletos), 0);
        return <strong>Total: {total}</strong>;
      },
    },
    {
      Header: "Checkin",
      accessor: "checkin",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
      Footer: (info) => {
        const total = info.rows.reduce((sum, row) => sum + Number(row.values.checkin), 0);
        return <strong>Total: {total}</strong>;
      },
    },
    {
      Header: "Total tipo A",
      accessor: "total_tipo_A",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Total tipo B",
      accessor: "total_tipo_B",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Total tipo C",
      accessor: "total_tipo_C",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Fecha Salida",
      accessor: "fecha_ida",
      Cell: (row) => {
        return (
          <span>
            {row?.cell?.value}
          </span>
        );
      },
    },
    {
      Header: "Fecha Compra",
      accessor: "fecha_compra",
      Cell: (row) => {
        return (
          <span>
            {row?.cell?.value}
          </span>
        );
      },
    },
    {
      Header: "Total de Compra",
      accessor: "total_de_compra",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
      Footer: (info) => {
        const total = info.rows.reduce((sum, row) => sum + Number(row.values.total_de_compra), 0);
        return <strong>Total: {total}</strong>;
      },
    },
    {
      Header: "Tipo Compra",
      accessor: "tipo_compra",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
    },
    {
      Header: "Cobrado Efectivo",
      accessor: "cobrado_efectivo",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
      Footer: (info) => {
        const total_efectivo = info.rows.reduce((sum, row) => sum + Number(row.values.cobrado_efectivo), 0);
        return <strong>Total: {total_efectivo}</strong>;
      },
    },
    {
      Header: "Cobrado Stripe",
      accessor: "cobrado_stripe",
      Cell: (row) => {
        return <span>{row?.cell?.value}</span>;
      },
      Footer: (info) => {
        const total_stripe = info.rows.reduce((sum, row) => sum + Number(row.values.cobrado_stripe), 0);
        return <strong>Total: {total_stripe}</strong>;
      },
    },
    


  ];

  const actions = [


  ];

  const columns = useMemo(() => COLUMNS, []);

  const [datos, setDatos] = useState([]);
  const [datosOriginales, setDatosOriginales] = useState([]);

  const [fechaInicioIda, setFechaInicioIda] = useState("");
  const [fechaFinIda, setFechaFinIda] = useState("");

  const [fechaInicioCompra, setFechaInicioCompra] = useState("");
  const [fechaFinCompra, setFechaFinCompra] = useState("");


  const userCtx = useContext(UserContext);
  const { user, authStatus, verifyingToken } = userCtx;

  const navigate = useNavigate();

  const getHistory = async (tipoUsuario, idempresa, idusuario) => {
    //console.log("TipoUsuario:"+tipoUsuario);
    //tipoUsuario == 1 SuperAdmin
    //tipoUsuario == 2 Administrador

    if (parseInt(tipoUsuario) == 1) {
      try {
        const res = await clienteAxios.get(`/admin/viaje-tour/viaje-Tours`);
        console.log(res.data);
        setDatos(res.data);
        setDatosOriginales(res.data); // 👈 guardamos copia original
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const res = await clienteAxios.get(`/admin/viaje-tour/historialByEmpresa/${idempresa}/admin/${idusuario}`);
        console.log(res.data);
        setDatos(res.data);
        setDatosOriginales(res.data); // 👈 guardamos copia original
      } catch (error) {
        console.log(error)
      }
    }
  }
  useEffect(() => {
    verifyingToken();
    //console.log(user);
    if (authStatus === false) {
      //navigate("/");
    }
    if (user && user[0].isSuperAdmin == 1) {
      getHistory(1, user[0].empresa_id, user[0].id);
    }
    if (user && user[0].isAdmin == 1 || user && user[0].isGuia == 1) {
      getHistory(2, user[0].empresa_id, user[0].id);
    }
    //console.log(datos);
  }, [authStatus])


  const header = [
    "Tour",
    "Id Reservación",
    "Nombre Visitante",
    "Correo",
    "No.Boletos",
    "Checkin",
    "Total tipo A",
    "Total tipo B",
    "Total tipo C",
    "Fecha Salida",
    "Fecha Compra",
    "Total de Compra",
    "Tipo Compra",
    "Cobrado Efectivo",
    "Cobrado Stripe"
  ];

  function handleDownloadExcel() {
    let newDatos = [];
    for (let i = 0; i < datos.length; i++) {
      newDatos.push({
        "nombre_del_tour": datos[i]['nombre_del_tour'],
        "id_reservacion": datos[i]['id_reservacion'],
        "nombre_visitante": datos[i]['nombre_visitante'],
        "correo": datos[i]['correo'],
        "no_boletos": datos[i]['no_boletos'],
        "checkin": datos[i]['checkin'],
        "total_tipo_A": datos[i]['total_tipo_A'],
        "total_tipo_B": datos[i]['total_tipo_B'],
        "total_tipo_C": datos[i]['total_tipo_C'],
        "fecha_ida": datos[i]['fecha_ida'],
        "fecha_compra": datos[i]['fecha_compra'],
        "total_de_compra": datos[i]['total_de_compra'],
        "tipo_compra": datos[i]['tipo_compra'],
        "cobrado_efectivo": datos[i]['cobrado_efectivo'],
        "cobrado_stripe": datos[i]['cobrado_stripe'],
      })
    }

    downloadExcel({
      fileName: "kahlo_history",
      sheet: "sales",
      tablePayload: {
        header,
        body: newDatos,
      },
    });
  }

const applyDateFilter = () => {
  const filtered = datosOriginales.filter((row) => {
    let valid = true;

    // Función para extraer la parte de la fecha (YYYY-MM-DD) del timestamp
    const getDatePart = (dateTimeStr) => {
      if (!dateTimeStr) return null;
      // Si ya es solo la fecha, retornar tal cual
      if (dateTimeStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateTimeStr;
      // Si incluye espacio, tomar la parte de la fecha
      if (dateTimeStr.includes(' ')) return dateTimeStr.split(' ')[0];
      // Si es formato ISO (con T), tomar la parte de la fecha
      if (dateTimeStr.includes('T')) return dateTimeStr.split('T')[0];
      return dateTimeStr;
    };

    // Filtrar por fecha ida
    if (fechaInicioIda || fechaFinIda) {
      if (!row.fecha_ida) {
        valid = false;
      } else {
        const fechaStr = getDatePart(row.fecha_ida);
        const start = fechaInicioIda || "1900-01-01";
        const end = fechaFinIda || "2100-12-31";
        
        if (!fechaStr || fechaStr < start || fechaStr > end) {
          valid = false;
        }
      }
    }

    // Filtrar por fecha compra
    if (fechaInicioCompra || fechaFinCompra) {
      if (!row.fecha_compra) {
        valid = false;
      } else {
        const fechaStr = getDatePart(row.fecha_compra);
        const start = fechaInicioCompra || "1900-01-01";
        const end = fechaFinCompra || "2100-12-31";
        
        if (!fechaStr || fechaStr < start || fechaStr > end) {
          valid = false;
        }
      }
    }

    // Si no hay filtros aplicados, mostrar todos los datos
    if (!fechaInicioIda && !fechaFinIda && !fechaInicioCompra && !fechaFinCompra) {
      valid = true;
    }

    return valid;
  });

  setDatos(filtered);
  gotoPage(0);
};

// Aplicar filtros cuando se cargan datos iniciales
useEffect(() => {
  if (datosOriginales.length > 0) {
    // No aplicar filtros automáticamente al cargar
    // Los filtros se aplicarán cuando el usuario haga clic en el botón
  }
}, [datosOriginales]);

  const handleAlta = () => {
    //navigate("/guias/alta");
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
  useEffect(() => {
    setPageSize(20); // 👈 ahora cada página tendrá 20 registros
  }, [setPageSize]);
  return (
    <>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Historial</h4>
          {/*
          <button onClick={(e) => handleAlta(e)} className="btn btn-success">Agregar nuevo</button>
          */}
          <button className="btn btn-success m-2" onClick={handleDownloadExcel}>Exportar</button>
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
        <div className="md:flex justify-center items-center mb-6">

{/* Filtro fecha ida */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-700">Fecha Ida Inicio</label>
    <input
      type="date"
      value={fechaInicioIda}
      onChange={(e) => setFechaInicioIda(e.target.value)}
      className="form-control"
    />
  </div>
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-700">Fecha Ida Fin</label>
    <input
      type="date"
      value={fechaFinIda}
      onChange={(e) => setFechaFinIda(e.target.value)}
      className="form-control"
    />
  </div>

  {/* Filtro fecha compra */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-700">Fecha Compra Inicio</label>
    <input
      type="date"
      value={fechaInicioCompra}
      onChange={(e) => setFechaInicioCompra(e.target.value)}
      className="form-control"
    />
  </div>
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-700">Fecha Compra Fin</label>
    <input
      type="date"
      value={fechaFinCompra}
      onChange={(e) => setFechaFinCompra(e.target.value)}
      className="form-control"
    />
  </div>

  <div className="flex flex-col justify-end">
    <button className="btn btn-primary mt-2" onClick={() => applyDateFilter()}>
      Filtrar
    </button>
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
                <tfoot>
                  {footerGroups.map((group) => (
                    <tr {...group.getFooterGroupProps()}>
                      {group.headers.map((column) => (
                        <td {...column.getFooterProps()} className="table-td">
                          {column.render("Footer")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tfoot>
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

export default Historial;

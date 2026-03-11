import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import clienteAxios from "@/configs/axios";

const UsuariosHorarios = () => {
  const id = localStorage.getItem("HorariosUser");
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location && location.state && location.state.returnTo) || localStorage.getItem("HorariosOrigin") || "/usuarios";
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editingHorario, setEditingHorario] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    lunes: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
    martes: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
    miercoles: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
    jueves: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
    viernes: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
    sabado: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 0 },
    domingo: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 0 }
  });

  const diasSemana = [
    { key: 'lunes', nombre: 'Lunes', dia_semana: 1 },
    { key: 'martes', nombre: 'Martes', dia_semana: 2 },
    { key: 'miercoles', nombre: 'Miércoles', dia_semana: 3 },
    { key: 'jueves', nombre: 'Jueves', dia_semana: 4 },
    { key: 'viernes', nombre: 'Viernes', dia_semana: 5 },
    { key: 'sabado', nombre: 'Sábado', dia_semana: 6 },
    { key: 'domingo', nombre: 'Domingo', dia_semana: 7 }
  ];

  const getHorarios = async () => {
    try {
      const res = await clienteAxios.get(`/venta/horarios-usuario/${id}`);
      console.log(res.data);
      setHorarios(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Error obteniendo los horarios del usuario");
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      const res = await clienteAxios.get(`/usuario/obtener/${id}`);
      console.log(res.data[0]);
      setUserData(res.data[0]);
    } catch (error) {
      console.log(error);
      toast.error("Error obteniendo los datos del usuario");
    }
  };

  const handleInputChange = (dia, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  const handleEdit = (horarioInicial) => {
    // Cargar TODOS los horarios existentes en el formulario
    const updatedFormData = { ...formData };
    
    horarios.forEach(horario => {
      const diaKey = diasSemana.find(d => d.dia_semana === horario.dia_semana)?.key;
      if (diaKey) {
        updatedFormData[diaKey] = {
          hora_entrada: horario.hora_entrada,
          hora_salida: horario.hora_salida,
          tolerancia_minutos: horario.tolerancia_minutos,
          activo: horario.descanso === 0 ? 1 : 0
        };
      }
    });
    
    setFormData(updatedFormData);
    setEditingHorario(horarioInicial);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingHorario(null);
    setIsEditMode(false);
    setShowForm(false);
    // Reset form to default values
    setFormData({
      lunes: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
      martes: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
      miercoles: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
      jueves: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
      viernes: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 1 },
      sabado: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 0 },
      domingo: { hora_entrada: '', hora_salida: '', tolerancia_minutos: 15, activo: 0 }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const horariosToCreate = diasSemana.map(dia => ({
        id_usuario: parseInt(id),
        dia_semana: dia.dia_semana,
        ...formData[dia.key],
        descanso: formData[dia.key].activo === 1 ? 0 : 1
      }));

      if (isEditMode && editingHorario) {
        // Modo edición - actualizar todos los horarios modificados
        const horariosToUpdate = diasSemana.map(dia => {
          const formDataDia = formData[dia.key];
          const existingHorario = horarios.find(h => h.dia_semana === dia.dia_semana);
          const isActive = formDataDia?.activo === 1;
          
          // Para Sábado (6) y Domingo (7), si están inactivos, asegurar que descanso = 1
          const isWeekend = dia.dia_semana === 6 || dia.dia_semana === 7;
          const descanso = (!isActive || isWeekend) ? 1 : 0;
          
          return {
            id: existingHorario?.id,
            id_usuario: parseInt(id),
            dia_semana: dia.dia_semana,
            hora_entrada: isActive ? (formDataDia?.hora_entrada || '') : null,
            hora_salida: isActive ? (formDataDia?.hora_salida || '') : null,
            tolerancia_minutos: formDataDia?.tolerancia_minutos || 15,
            activo: isActive ? 1 : 0,  // Enviar activo para que la API lo use
            descanso: descanso  // Mantener por si acaso
          };
        }).filter(h => h.id); // Solo enviar horarios que existen (tienen ID)

        // Enviar todos los horarios para actualizarlos individualmente
        let successCount = 0;
        let errorCount = 0;
        
        for (const horarioData of horariosToUpdate) {
          try {
            await clienteAxios.post('/venta/horarios-usuario-actualizar', horarioData);
            successCount++;
          } catch (error) {
            errorCount++;
            // No lanzar el error para que continúe con los demás días
          }
        }
        
        if (successCount > 0) {
          if (errorCount === 0) {
            toast.success("¡Horarios actualizados exitosamente!");
          } else {
            toast.success(`¡Horarios actualizados! ${successCount} días modificados correctamente`);
          }
        } else {
          toast.error("No se pudo actualizar ningún horario");
        }
      } else {
        // Modo creación - crear todos los horarios
        const res = await clienteAxios.post('/venta/horarios-usuario-crear', {
          id_usuario: parseInt(id),
          horarios: horariosToCreate
        });
        toast.success("Horarios creados exitosamente");
      }

      handleCancelEdit(); // Reset form and edit state
      getHorarios(); // Refresh the list
      
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || (isEditMode ? "Error actualizando el horario" : "Error creando los horarios"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      getUserData();
      getHorarios();
    } else {
      toast.error("No se encontró el ID del usuario");
      navigate(returnTo);
    }
  }, [id, navigate]);

  return (
    <>
      <ToastContainer />
      <div className="grid xl:grid-cols-1 grid-cols-1 gap-5">
        <Card title={`Horarios del Usuario${userData ? `: ${userData.nombres} ${userData.apellidos}` : ''}`}>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Lista de Horarios</h3>
              <div className="flex space-x-2">
                <Button 
                  text="Editar Horarios"
                  className="btn btn-primary"
                  onClick={() => {
                    // Cargar el primer horario para iniciar edición
                    if (horarios.length > 0) {
                      handleEdit(horarios[0]);
                    }
                  }}
                >
                  Editar Horarios
                </Button>
                <Button 
                  onClick={() => navigate(returnTo)}
                  className="btn btn-secondary"
                >
                  Volver
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <p>Cargando horarios...</p>
              </div>
            ) : showForm ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="text-md font-semibold mb-4">
                    {isEditMode ? 'Editar Horario' : 'Configurar Horarios Semanales'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {diasSemana.map((dia) => (
                      <div key={dia.key} className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-sm">{dia.nombre}</h5>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData[dia.key].activo === 1}
                              onChange={(e) => handleInputChange(dia.key, 'activo', e.target.checked ? 1 : 0)}
                              className="form-checkbox"
                            />
                            <span className="text-xs">Activo</span>
                          </label>
                        </div>
                        
                        {formData[dia.key].activo === 1 && (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Entrada
                              </label>
                              <input
                                type="time"
                                value={formData[dia.key].hora_entrada}
                                onChange={(e) => handleInputChange(dia.key, 'hora_entrada', e.target.value)}
                                className="form-control text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Salida
                              </label>
                              <input
                                type="time"
                                value={formData[dia.key].hora_salida}
                                onChange={(e) => handleInputChange(dia.key, 'hora_salida', e.target.value)}
                                className="form-control text-sm"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Tolerancia (min)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="60"
                                value={formData[dia.key].tolerancia_minutos}
                                onChange={(e) => handleInputChange(dia.key, 'tolerancia_minutos', parseInt(e.target.value))}
                                className="form-control text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (isEditMode ? "Actualizando..." : "Guardando...") : (isEditMode ? "Actualizar Horario" : "Guardar Horarios")}
                  </Button>
                </div>
              </form>
            ) : !showForm && horarios.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No se encontraron horarios para este usuario
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  Crear Horarios Semanales
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Día
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Hora Entrada
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Hora Salida
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tolerancia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                    {horarios.map((horario) => (
                      <tr key={horario.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                          {horario.nombre_dia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {horario.hora_entrada}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {horario.hora_salida}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {horario.tolerancia_minutos} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            horario.activo === 1 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {horario.activo === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default UsuariosHorarios;

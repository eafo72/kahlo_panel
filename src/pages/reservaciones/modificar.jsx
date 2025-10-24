import React, { useState, useEffect, useCallback } from 'react';
import clienteAxios from '../../configs/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Flatpickr from 'react-flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import qrcode from 'qrcode';

//import 'flatpickr/dist/themes/material_red.css';


const ReservacionesModificarPage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [tourData, setTourData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [ticketQuantities, setTicketQuantities] = useState({
        entradaTipoA: 0, // General
        entradaTipoB: 0, // Mexicano
        entradaTipoC: 0, // Especial
    });
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [contactInfo, setContactInfo] = useState({
        nombre_cliente: '',
        correo: ''
    });
    const [isLogin, setIsLogin] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [reservationId, setReservationId] = useState(null);
    const [clientExist, setClientExist] = useState(null);
    const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
    const [reservationNumber, setReservationNumber] = useState('');
    const [fechaAnterior, setFechaAnterior] = useState(null);
    const [horarioAnterior, setHorarioAnterior] = useState('');

    const tourId = 24;

    // Fetch Tour Data on component mount
    useEffect(() => {
        const fetchTourData = async () => {

            if (!tourId) {
                toast.error('ID de experiencia no especificado');
                return;
            }
            try {
                const response = await clienteAxios.get(`/admin/tour/obtener/${tourId}`);
                if (response.data?.tour?.length > 0) {
                    setTourData(response.data.tour[0]);
                } else {
                    throw new Error('No se encontraron datos del tour');
                }
            } catch (error) {
                console.error("Error al obtener datos del tour:", error);
                toast.error('No pudimos cargar la información. Intenta nuevamente.');
            }
        };
        fetchTourData();
    }, []);

    const handleQtyChange = (type, amount) => {
        setTicketQuantities(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] + amount)
        }));
    };

    const totalVisitantes = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);

    const handleCheckHorarios = async () => {
        if (totalVisitantes === 0 || totalVisitantes > 30) {
            toast.warn('Debes seleccionar entre 1 y 30 visitantes.');
            return;
        }

        if (!selectedDate) {
            toast.warn('Selecciona una fecha primero');
            return;
        }


        const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

        const promise = clienteAxios.get(`/venta/horarios/${tourId}/fecha/${formattedDate}/boletos/${totalVisitantes}`);

        toast.promise(promise, {
            pending: 'Verificando horarios...',
            success: {
                render({ data }) {
                    const response = data;
                    if (response.data?.horarios?.length > 0) {
                        const available = response.data.horarios.filter(h => h.disponible);
                        if (available.length > 0) {
                            setAvailableTimes(response.data.horarios);
                            return 'Horarios disponibles. Ya puedes elegir tu horario';
                        } else {
                            setAvailableTimes([]);
                            toast.warn('No hay horarios disponibles para la fecha y cantidad de boletos seleccionada.');
                            return 'No se encontraron horarios disponibles.';
                        }
                    } else {
                        setAvailableTimes([]);
                        return 'No se encontraron horarios.';
                    }
                }
            },
            error: 'No se pudieron obtener los horarios disponibles.'
        });
    };

    const handleReservationChange = async () => {
        try {
            // Deshabilitar botones
            setIsPaymentInProgress(true);
            
            // Obtener token de autenticación
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }
            
            // Configurar encabezado de autenticación
            clienteAxios.defaults.headers.common['x-auth-token'] = token;
            
            // Recolectar datos del formulario
            const fecha = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
            const horario = selectedTime;
            
            // Validar datos requeridos
            if (!fecha || !horario || !reservationId) {
                toast.error('Faltan datos requeridos para procesar el cambio de horario');
                return;
            }
            
            // 1️⃣ Primero verificamos si el traspaso es posible
            const checkResponse = await clienteAxios.get('/venta/modificar-check', {
                params: {
                    reserva: reservationId,
                    fecha: fecha,
                    hora: horario
                },
                headers: {
                    'x-auth-token': token
                }
            });

            console.log('Respuesta de verificación:', checkResponse.data);

            if (checkResponse.data.error) {
                throw new Error(checkResponse.data.msg || 'Error al verificar disponibilidad');
            }

            if (!checkResponse.data.es_posible_traspaso) {
                toast.error(checkResponse.data.msg || 'No es posible realizar el cambio de horario');
                return;
            }

            // 2️⃣ Si el traspaso es posible, procedemos con la modificación
            const modifyResponse = await clienteAxios.post('/venta/modificar-horario', 
                { datos_para_horario: checkResponse.data.datos_para_horario },
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );

            console.log('Respuesta de modificación:', modifyResponse.data);

            if (modifyResponse.data.error) {
                throw new Error(modifyResponse.data.msg || 'Error al modificar el horario');
            }

            // Mostrar mensaje de éxito
            toast.success('¡Horario modificado exitosamente!');
            setShowQR(true);
            
            // Actualizar el estado con la nueva información si es necesario
            if (modifyResponse.data.detalles) {
                console.log('Detalles de la modificación:', modifyResponse.data.detalles);
            }

        } catch (error) {
            console.error('Error al procesar el cambio de horario:', error);
            const errorMessage = error.response?.data?.msg || error.message || 'Error al procesar el cambio de horario';
            toast.error(errorMessage);
        } finally {
            setIsPaymentInProgress(false);
        }
    };

    const fetchReservationData = async (reservationId) => {
        setReservationId(reservationId);
        try {
            const response = await clienteAxios.get(`/venta/reservacion/${reservationId}`);
            const reserva = response.data[0]; 
            
            if (!reserva || !reserva.tipos_boletos) {
                throw new Error('La reservación no existe');
            }
            
            // Parsear el string JSON de tipos_boletos
            let tiposBoletos;
            try {
                tiposBoletos = JSON.parse(reserva.tipos_boletos);
            } catch (parseError) {
                console.error('Error al parsear tipos_boletos:', parseError);
                throw new Error('Formato de boletos no válido');
            }
            
            // Actualizar la cantidad de boletos con los datos de la API
            setTicketQuantities({
                entradaTipoA: tiposBoletos.tipoA || 0,
                entradaTipoB: tiposBoletos.tipoB || 0,
                entradaTipoC: tiposBoletos.tipoC || 0
            });
            
            setContactInfo({
                nombre_cliente: reserva.nombre_cliente,
                correo: reserva.correo
            });


            // Guardar la fecha y horario anteriores de la reservación
            if (reserva.fecha_ida) {
                try {
                    // El formato esperado es ISO: '2025-10-31T15:00:00.000Z'
                    const fechaISO = reserva.fecha_ida;
                    const fecha = new Date(fechaISO);
                    
                    if (isNaN(fecha.getTime())) {
                        console.error('Fecha no válida:', fechaISO);
                        throw new Error('Formato de fecha no válido');
                    }
                    
                    // Guardar la fecha completa como string ISO
                    setFechaAnterior(fechaISO);
                    
                    // Extraer la hora en formato HH:MM
                    const horaPart = fechaISO.split('T')[1]?.split('.')[0];
                    if (horaPart) {
                        const [horas, minutos] = horaPart.split(':').map(Number);
                        const horaFormateada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
                        setHorarioAnterior(horaFormateada);
                    }
                    
                    
                } catch (error) {
                    console.error('Error al procesar la fecha de la reservación:', error);
                    throw new Error('Error al procesar la fecha de la reservación');
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error al obtener los datos de la reservación:', error);
            const errorMessage = error.response?.data?.msg || error.message || 'No se pudo obtener la información de la reservación';
            toast.error(errorMessage);
            return false;
        }
    };

    const nextStep = async () => {
        // Validations
        if (currentStep === 0) {
            if (!reservationNumber.trim()) {
                return toast.warn('Por favor ingresa el id de reservación');
            }
            // Intentar obtener los datos de la reservación
            const success = await fetchReservationData(reservationNumber.trim());
            if (!success) return; // No avanzar si hay error
        }
        if (currentStep === 1 && !selectedDate) {
            return toast.warn('Selecciona una fecha');
        }
        if (currentStep === 2) {
            if (totalVisitantes === 0) return toast.warn('Selecciona al menos un boleto');
            if (!selectedTime) return toast.warn('Selecciona un horario');
        }
        if (currentStep === 3) {
            if (!contactInfo.nombre_cliente || !contactInfo.correo) {
                return toast.warn('Completa nombre y correo.');
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <Step0 
                        reservationNumber={reservationNumber}
                        setReservationNumber={setReservationNumber}
                        onNext={nextStep}
                    />;
            case 1:
                return <Step1 
                    selectedDate={selectedDate} 
                    setSelectedDate={setSelectedDate} 
                    tourData={tourData}
                    fechaAnterior={fechaAnterior}
                    horarioAnterior={horarioAnterior}
                />;
            case 2:
                return <Step2 ticketQuantities={ticketQuantities} handleQtyChange={handleQtyChange} availableTimes={availableTimes} selectedTime={selectedTime} setSelectedTime={setSelectedTime} handleCheckHorarios={handleCheckHorarios} />;
            case 3:
                return <Step3 contactInfo={contactInfo} setContactInfo={setContactInfo} isLogin={isLogin} setIsLogin={setIsLogin} />;
            case 4:
                return <Step4 tourData={tourData} selectedDate={selectedDate} selectedTime={selectedTime} ticketQuantities={ticketQuantities} contactInfo={contactInfo} totalVisitantes={totalVisitantes} />;
            default:
                return <Step1 />;
        }
    };

    return (
        <>
            <ToastContainer />

            {!showQR ? (
                <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="card rounded-lg bg-white dark:bg-slate-800 shadow-base border border-slate-200 dark:border-slate-700">
                            <div className="card-header border-b border-slate-200 dark:border-slate-700">
                                <h5 className="card-title text-slate-900 dark:text-white">
                                    {tourData ? `Modificar Reservaciones` : 'Cargando...'}
                                </h5>
                            </div>
                            <div className="card-body p-6">
                                <div className="flex justify-center items-center gap-4 my-6">
                                    {['Id de Reservación', 'Fecha', 'Boletos', 'Datos', 'Resumen'].map((label, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep > index ? 'bg-primary-500 text-white' :
                                                    currentStep === index ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className={`ml-2 text-sm font-medium ${currentStep >= index ? 'text-primary-600' : 'text-slate-500'
                                                }`}>
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <form id="ticket-form" onSubmit={(e) => e.preventDefault()}>
                                    {renderStep()}
                                    <div className="card-footer border-t border-slate-200 dark:border-slate-700 pt-6">
                                        <div className="flex justify-end gap-3">
                                            {currentStep > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={prevStep}
                                                >
                                                    ← Atrás
                                                </button>
                                            )}
                                            {currentStep < 4 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={nextStep}
                                                >
                                                    Siguiente →
                                                </button>
                                            )}
                                            {currentStep === 4 && (
                                                <>
                                                <button
                                                    type="button"
                                                    className={`btn ${isPaymentInProgress ? 'btn-disabled' : 'btn-success'}`}
                                                    id="btn-pagar"
                                                    onClick={() => handleReservationChange()}
                                                    disabled={isPaymentInProgress}
                                                >
                                                    {isPaymentInProgress ? 'Procesando...' : 'Guardar Cambios'}
                                                </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            ) : (
                <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="card rounded-lg bg-white dark:bg-slate-800 shadow-base border border-slate-200 dark:border-slate-700">
                            <div className="card-body p-8 text-center">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        ¡Reservación reprogramada exitosamente!
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setShowQR(false);
                                                setReservationId(null);
                                                setReservationNumber(null);
                                                // Reset form for new purchase
                                                setCurrentStep(0);
                                                setSelectedDate(null);
                                                setTicketQuantities({
                                                    entradaTipoA: 0,
                                                    entradaTipoB: 0,
                                                    entradaTipoC: 0,
                                                });
                                                setSelectedTime('');
                                                setContactInfo({
                                                    nombre_cliente: '',
                                                    correo: ''
                                                });
                                            }}
                                        >
                                            Modificar otra Reservación
                                        </button>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </>
    );
};

    // Step 0: Reservation Number
    const Step0 = ({ reservationNumber, setReservationNumber, onNext }) => {
        const handleSubmit = (e) => {
            e.preventDefault();
            if (reservationNumber.trim()) {
                onNext();
            } else {
                toast.error('Por favor ingresa un número de reservación');
            }
        };

        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Ingresa el id de reservación</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="reservationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Id de Reservación
                        </label>
                        <input
                            type="text"
                            id="reservationNumber"
                            value={reservationNumber}
                            onChange={(e) => setReservationNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Step 1: Date Selection
const Step1 = ({ selectedDate, setSelectedDate, tourData, fechaAnterior, horarioAnterior }) => {
    const calendarOptions = {
        inline: true,
        locale: Spanish,
        dateFormat: "d/m/Y",
        minDate: "today",
        disable: [
            (date) => date.getDay() === 2, // Disable Tuesdays
            ...(Array.isArray((tourData == null ? void 0 : tourData.fechas_no_disponibles)) ? (tourData == null ? void 0 : tourData.fechas_no_disponibles) : []).map(d => new Date(d))
        ],
    };

    // Función para formatear la fecha en español desde formato ISO (2025-10-31T15:00:00.000Z)
    // Sin conversión de zona horaria
    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Fecha no disponible';
        
        try {
            // Extraer directamente los componentes de la cadena ISO
            const [anio, mes, dia] = fechaISO.substring(0, 10).split('-').map(Number);
            
            // Nombres de los días y meses en español
            const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            
            // Crear fecha en UTC para evitar conversión de zona horaria
            const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));
            const diaSemana = dias[fechaUTC.getUTCDay()];
            const nombreMes = meses[mes - 1];
            
            return `${diaSemana}, ${dia} de ${nombreMes} de ${anio}`.toLowerCase();
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha no disponible';
        }
    };

    // Función para formatear la hora desde formato ISO (2025-10-31T15:00:00.000Z)
    // Sin conversión de zona horaria
    const formatearHora = (fechaISO) => {
        if (!fechaISO) return 'Hora no disponible';
        
        try {
            // Extraer directamente las horas y minutos del string ISO
            const horas = parseInt(fechaISO.substring(11, 13), 10);
            const minutos = fechaISO.substring(14, 16);
            
            // Formatear en 12 horas con AM/PM
            const periodo = horas >= 12 ? 'PM' : 'AM';
            const hora12 = horas % 12 || 12;
            
            return `${hora12.toString().padStart(2, '0')}:${minutos} ${periodo}`;
        } catch (error) {
            console.error('Error al formatear hora:', error);
            return 'Hora no disponible';
        }
    };

    // Debugging info
    console.log('Step1 - fechaAnterior:', fechaAnterior);
    console.log('Step1 - horarioAnterior:', horarioAnterior);

    return (
        <div className="space-y-6">
            {/* Sección de información de la reserva actual */}
            {fechaAnterior && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-md p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Fecha y hora actual de la reserva
                            </h3>
                            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                <p>
                                    {formatearFecha(fechaAnterior)} a las {formatearHora(fechaAnterior)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center">
                <h4 className="card-title text-slate-900 dark:text-white">Selecciona la nueva fecha</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Elige una fecha disponible para continuar</p>
            </div>

            <div className="card border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="card-body p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="flatpickr-wrapper">
                            <Flatpickr
                                value={selectedDate}
                                onChange={([date]) => setSelectedDate(date)}
                                options={calendarOptions}
                            />
                        </div>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                                .flatpickr-wrapper .flatpickr-input {
                                    display: none !important;
                                    opacity: 0 !important;
                                    position: absolute !important;
                                    z-index: -9999 !important;
                                    pointer-events: none !important;
                                    width: 0 !important;
                                    height: 0 !important;
                                    overflow: hidden !important;
                                }
                            `
                        }} />
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg min-h-[60px] flex items-center justify-center">
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                {selectedDate ? `Seleccionaste: ${selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : 'Selecciona una fecha para ver los detalles'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 2: Quantity and Time
const Step2 = ({ ticketQuantities, handleQtyChange, availableTimes, selectedTime, setSelectedTime, handleCheckHorarios }) => (
    <div className="space-y-6">

        {/* Ticket Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TicketInput 
                type="entradaTipoA" 
                label="Entrada General" 
                price="270.00" 
                value={ticketQuantities.entradaTipoA} 
                onChange={handleQtyChange} 
                disabled={true}
            />
            <TicketInput 
                type="entradaTipoB" 
                label="Ciudadano Mexicano" 
                price="130.00" 
                value={ticketQuantities.entradaTipoB} 
                onChange={handleQtyChange} 
                disabled={true}
            />
            <TicketInput 
                type="entradaTipoC" 
                label="Estudiante / Adulto Mayor / Niño (-12)" 
                price="65.00" 
                value={ticketQuantities.entradaTipoC} 
                onChange={handleQtyChange} 
                disabled={true}
            />
        </div>

        {/* Time Selection */}
        <div className="card border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="card-header">
                <h5 className="card-title text-slate-900 dark:text-white">Selecciona un horario</h5>
                <p className="card-subtitle text-slate-600 dark:text-slate-300">Primero consulta la disponibilidad</p>
            </div>
            <div className="card-body space-y-4">
                <button
                    type="button"
                    onClick={handleCheckHorarios}
                    className="btn btn-primary w-full"
                >
                    Consultar Horarios Disponibles
                </button>

                <div className="form-group">
                    <label htmlFor="horario" className="form-label">
                        Horario disponible
                    </label>
                    <select
                        id="horario"
                        className="form-control bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:border-slate-200 dark:disabled:border-slate-600"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        disabled={availableTimes.length === 0}
                    >
                        <option value="" disabled>-- Elige un horario --</option>
                        {availableTimes.map(horario => (
                            <option key={horario.hora_salida} value={horario.hora_salida} disabled={!horario.disponible}>
                                {horario.hora_salida} {!horario.disponible ? `(${horario.lugares_disp} disponibles)` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    </div>
);

const TicketInput = ({ type, label, price, value, onChange, disabled = false }) => (
    <div className={`card transition-colors duration-200 ${disabled ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 opacity-75' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'}`}>
        <div className="card-body p-4">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <h5 className={`card-title text-base ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-slate-900 dark:text-white'}`}>{label}</h5>
                    <p className={`font-semibold text-lg ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-primary-600 dark:text-primary-400'}`}>${price} MXN</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className={`btn btn-outline-secondary btn-sm w-8 h-8 p-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !disabled && onChange(type, -1)}
                        disabled={disabled}
                    >
                        −
                    </button>
                    <span className={`text-xl font-semibold min-w-[2rem] text-center ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-slate-900 dark:text-white'}`}>
                        {value}
                    </span>
                    <button
                        type="button"
                        className={`btn btn-outline-secondary btn-sm w-8 h-8 p-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !disabled && onChange(type, 1)}
                        disabled={disabled}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// Step 3: Contact Info
const Step3 = ({ contactInfo, setContactInfo, isLogin, setIsLogin }) => {
    const handleChange = (e) => {
        const { id, value } = e.target;
        setContactInfo(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h4 className="card-title text-slate-900 dark:text-white">Información de contacto</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Completa tus datos para continuar con la compra</p>
            </div>

            <div className="card border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="card-body space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="nombre_cliente" className="form-label">
                                Nombre Cliente *
                            </label>
                            <input
                                type="text"
                                id="nombre_cliente"
                                className="form-control bg-gray-100 cursor-not-allowed"
                                value={contactInfo.nombre_cliente}
                                readOnly
                                disabled
                                placeholder="Nombre del cliente"
                            />
                        </div>

                        
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="correo" className="form-label">
                                Correo electrónico *
                            </label>
                            <input
                                type="email"
                                id="correo"
                                className="form-control bg-gray-100 cursor-not-allowed"
                                value={contactInfo.correo}
                                readOnly
                                disabled
                                placeholder="Correo electrónico"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 4: Summary
const Step4 = ({ tourData, selectedDate, selectedTime, ticketQuantities, contactInfo, totalVisitantes }) => {
    const totalAmount = (ticketQuantities.entradaTipoA * 270) + (ticketQuantities.entradaTipoB * 130) + (ticketQuantities.entradaTipoC * 65);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h4 className="card-title text-slate-900 dark:text-white">Resumen de la reservación</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Revisa todos los detalles antes de confirmar la reserva</p>
            </div>

            <div className="card border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="card-body space-y-4">
                    <SummaryRow label="Tipo de experiencia" value={tourData?.nombre || ''} />
                    <SummaryRow label="Fecha seleccionada" value={selectedDate?.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) || ''} />
                    <SummaryRow label="Horario" value={selectedTime} />

                    {totalVisitantes > 0 && (
                        <SummaryRow
                            label="Visitantes"
                            value={`${totalVisitantes} personas (${Object.entries(ticketQuantities).filter(([, qty]) => qty > 0).map(([type, qty]) => `${qty} ${type.replace('entradaTipo', '').replace(/([A-Z])/g, ' $1').trim()}`).join(', ')})`}
                        />
                    )}

                    <SummaryRow label="Titular" value={`${contactInfo.nombre_cliente}`} />
                    <SummaryRow label="Correo de contacto" value={contactInfo.correo} />

                    
                </div>
            </div>
        </div>
    );
};

const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between items-start py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
        <div className="flex-1">
            <h5 className="font-medium text-slate-600 dark:text-slate-400 text-sm">{label}</h5>
            <p className="font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
    </div>
);

export default ReservacionesModificarPage;

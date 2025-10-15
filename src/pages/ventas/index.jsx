import React, { useState, useEffect, useCallback } from 'react';
import clienteAxios from '../../configs/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Flatpickr from 'react-flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

//import 'flatpickr/dist/themes/material_red.css';


const VentasPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
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
        nombres: '',
        apellidos: '',
        telefono: '',
        correo: '',
        password: '',
    });
    const [isLogin, setIsLogin] = useState(false);

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

    const handlePayment = async () => {
        try {
            // Recolectar datos del formulario
            const fecha = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
            const horario = selectedTime;

            const tipoA = ticketQuantities.entradaTipoA;
            const tipoB = ticketQuantities.entradaTipoB;
            const tipoC = ticketQuantities.entradaTipoC;

            const tipos_boletos = JSON.stringify({ tipoA, tipoB, tipoC });
            const visitantes = totalVisitantes;
            const totalCalculado = (270 * tipoA) + (130 * tipoB) + (65 * tipoC);

            const nombre = contactInfo.nombres.trim();
            const apellidos = contactInfo.apellidos.trim();
            const telefono = contactInfo.telefono;
            const correo = contactInfo.correo;

            // Validar datos requeridos
            if (!fecha || !horario || !nombre || !apellidos || !correo || visitantes === 0) {
                toast.error('Faltan datos requeridos para procesar el pago');
                return;
            }

           
            console.log('Preparando datos para pago:', {
                tourId,
                fecha,
                horario,
                visitantes,
                nombre,
                apellidos,
                correo,
                telefono,
                total: totalCalculado
            });

            // Realizar la solicitud de creación de venta
            const response = await clienteAxios.post(`/venta/crear-admin`, {
                "no_boletos": parseInt(visitantes),
                "tipos_boletos": tipos_boletos,
                "pagado": 1,
                "comision": 2.3,
                "status_traspaso": 1,
                "nombre_cliente": nombre,
                "apellidos_cliente": apellidos,
                "telefono": telefono,
                "correo": correo,
                "tourId": tourId,
                "fecha_ida": fecha,
                "horaCompleta": horario,
                "total": totalCalculado
            });

            console.log('Respuesta de la API:', response.data);

            if (response.data && response.data.id_reservacion) {
                toast.success(`Transacción aprobada. ID Reservación: ${response.data.id_reservacion}`);
                // Refrescar la página después de 2 segundos para permitir nueva compra
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error('No se recibió un ID de reservación válido');
            }

        } catch (error) {
            console.error('Error al procesar el pago:', error);
             const errorMessage = error.response?.data?.msg || 'Error al procesar el pago. Por favor, intenta nuevamente.';
            toast.error(errorMessage);
        } finally {
            setPaymentData(prev => ({ ...prev, isProcessing: false }));
        }
    };

    const nextStep = () => {
        // Validations
        if (currentStep === 1 && !selectedDate) {
            return toast.warn('Selecciona una fecha');
        }
        if (currentStep === 2) {
            if (totalVisitantes === 0) return toast.warn('Selecciona al menos un boleto');
            if (!selectedTime) return toast.warn('Selecciona un horario');
        }
        if (currentStep === 3) {
            if (!contactInfo.nombres || !contactInfo.apellidos || !contactInfo.correo) {
                return toast.warn('Completa nombre, apellido y correo.');
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1 selectedDate={selectedDate} setSelectedDate={setSelectedDate} tourData={tourData} />;
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


            <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="card rounded-lg bg-white dark:bg-slate-800 shadow-base border border-slate-200 dark:border-slate-700">
                        <div className="card-header border-b border-slate-200 dark:border-slate-700">
                            <h5 className="card-title text-slate-900 dark:text-white">
                                {tourData ? `Compra de Boletos: ${tourData.nombre}` : 'Cargando...'}
                            </h5>
                        </div>
                        <div className="card-body p-6">
                            <div className="flex justify-center items-center gap-4 my-6">
                                {['Fecha', 'Boletos', 'Datos', 'Resumen'].map((label, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                            currentStep > index + 1 ? 'bg-primary-500 text-white' :
                                            currentStep === index + 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <span className={`ml-2 text-sm font-medium ${
                                            currentStep >= index + 1 ? 'text-primary-600' : 'text-slate-500'
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
                                        {currentStep > 1 && (
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
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                id="btn-pagar"
                                                onClick={handlePayment}
                                            >
                                                Pagar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>



        </>
    );
};

// Step 1: Date Selection
const Step1 = ({ selectedDate, setSelectedDate, tourData }) => {
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

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h4 className="card-title text-slate-900 dark:text-white">Selecciona la fecha de tu visita</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Elige una fecha disponible para continuar</p>
            </div>

            <div className="card border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="card-body p-6">
                    <div className="flex flex-col items-center text-center">
                        <Flatpickr
                            value={selectedDate}
                            onChange={([date]) => setSelectedDate(date)}
                            options={calendarOptions}
                        />
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
        <div className="text-center">
            <h4 className="card-title text-slate-900 dark:text-white">Selecciona cantidad y horario</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Elige el tipo y cantidad de boletos, luego consulta horarios disponibles</p>
        </div>

        {/* Ticket Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TicketInput type="entradaTipoA" label="Entrada General" price="270.00" value={ticketQuantities.entradaTipoA} onChange={handleQtyChange} />
            <TicketInput type="entradaTipoB" label="Ciudadano Mexicano" price="130.00" value={ticketQuantities.entradaTipoB} onChange={handleQtyChange} />
            <TicketInput type="entradaTipoC" label="Estudiante / Adulto Mayor / Niño (-12)" price="65.00" value={ticketQuantities.entradaTipoC} onChange={handleQtyChange} />
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

const TicketInput = ({ type, label, price, value, onChange }) => (
    <div className="card border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200">
        <div className="card-body p-4">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <h5 className="card-title text-slate-900 dark:text-white text-base">{label}</h5>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold text-lg">${price} MXN</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm w-8 h-8 p-0"
                        onClick={() => onChange(type, -1)}
                    >
                        −
                    </button>
                    <span className="text-xl font-semibold text-slate-900 dark:text-white min-w-[2rem] text-center">
                        {value}
                    </span>
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm w-8 h-8 p-0"
                        onClick={() => onChange(type, 1)}
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
                            <label htmlFor="nombres" className="form-label">
                                Nombres *
                            </label>
                            <input
                                type="text"
                                id="nombres"
                                className="form-control"
                                value={contactInfo.nombres}
                                onChange={handleChange}
                                placeholder="Ingresa tu nombre"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellidos" className="form-label">
                                Apellidos *
                            </label>
                            <input
                                type="text"
                                id="apellidos"
                                className="form-control"
                                value={contactInfo.apellidos}
                                onChange={handleChange}
                                placeholder="Ingresa tus apellidos"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="telefono" className="form-label">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                id="telefono"
                                className="form-control"
                                value={contactInfo.telefono}
                                onChange={handleChange}
                                placeholder="Ingresa tu teléfono"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="correo" className="form-label">
                                Correo electrónico *
                            </label>
                            <input
                                type="email"
                                id="correo"
                                className="form-control"
                                value={contactInfo.correo}
                                onChange={handleChange}
                                placeholder="Ingresa tu correo electrónico"
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
    const total = (ticketQuantities.entradaTipoA * 270) + (ticketQuantities.entradaTipoB * 130) + (ticketQuantities.entradaTipoC * 65);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h4 className="card-title text-slate-900 dark:text-white">Resumen de tu reservación</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Revisa todos los detalles antes de confirmar tu compra</p>
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

                    <SummaryRow label="Titular" value={`${contactInfo.nombres} ${contactInfo.apellidos}`} />
                    <SummaryRow label="Correo de contacto" value={contactInfo.correo} />

                    <div className="border-2 border-primary-500 dark:border-primary-400 rounded-lg p-6 bg-primary-50 dark:bg-primary-900/20">
                        <div className="text-center">
                            <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Total a Pagar</h5>
                            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">${total.toLocaleString('es-MX')} MXN</p>
                        </div>
                    </div>
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

export default VentasPage;

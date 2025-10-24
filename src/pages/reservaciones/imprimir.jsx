import React, { useState, useEffect } from 'react';
import clienteAxios from '../../configs/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReservacionesImprimirPage = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const [tourData, setTourData] = useState(null);

    const [ticketQuantities, setTicketQuantities] = useState({
        entradaTipoA: 0, // General
        entradaTipoB: 0, // Mexicano
        entradaTipoC: 0, // Especial
    });
    const [contactInfo, setContactInfo] = useState({
        nombre_cliente: '',
        correo: '',
        total: 0
    });

    const [reservationId, setReservationId] = useState(null);

    const [reservationNumber, setReservationNumber] = useState('');
    
    const [fecha, setFecha] = useState(null);
    const [fechaCompra, setFechaCompra] = useState(null);


    const tourId = 24;


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
                correo: reserva.correo,
                total: reserva.total
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
                    setFecha(fechaISO);


                } catch (error) {
                    console.error('Error al procesar la fecha de la reservación:', error);
                    throw new Error('Error al procesar la fecha de la reservación');
                }
            }

            if (reserva.fecha_compra) {
                try {
                    // El formato esperado es ISO: '2025-10-31T15:00:00.000Z'
                    const fechaISO = reserva.fecha_compra;
                    const fecha = new Date(fechaISO);

                    if (isNaN(fecha.getTime())) {
                        console.error('Fecha compra no válida:', fechaISO);
                        throw new Error('Formato de fecha compra no válido');
                    }

                    // Guardar la fecha completa como string ISO
                    setFechaCompra(fechaISO);


                } catch (error) {
                    console.error('Error al procesar la fecha de compra de la reservación:', error);
                    throw new Error('Error al procesar la fecha de compra de la reservación');
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

    useEffect(() => {
        fetchTourData();
    }, []);



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
                    fecha={fecha}
                    ticketQuantities={ticketQuantities}
                    contactInfo={contactInfo}
                    reservationNumber={reservationNumber}
                />;

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
                                {`Imprimir boleto de Reservación`}
                            </h5>
                        </div>
                        <div className="card-body p-6">
                            <div className="flex justify-center items-center gap-4 my-6">
                                {['Id de Reservación', 'Datos'].map((label, index) => (
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
                                        {currentStep < 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={nextStep}
                                            >
                                                Siguiente →
                                            </button>
                                        )}
                                        {currentStep === 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => {
                                                        // Open print window
                                                        const printWindow = window.open('', '_blank');

                                                        // Create ticket HTML content
                                                        const ticketHtml = `
                                                    <!DOCTYPE html>
                                                    <html>
                                                    <head>
                                                        <meta charset="UTF-8">
                                                        <title>¡Compra Exitosa! - ${tourData?.nombre || '¡Compra Exitosa!'}</title>
                                                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                                                        <style>
                                                            @page { margin: 0; }
                                                            body { 
                                                                font-family: Arial, sans-serif; 
                                                                margin: 0;
                                                                padding: 10px;
                                                                background: #fff;
                                                                color: #000;
                                                            }
                                                            .ticket-content {
                                                                width: 80mm;
                                                                max-width: 80mm;
                                                                margin: 0 auto;
                                                                padding: 10px 0;
                                                                text-align: center;
                                                            }
                                                            h2 {
                                                                font-size: 20pt;
                                                                margin-bottom: 10px;
                                                            }
                                                            p {
                                                                font-size: 13pt;
                                                                margin: 5px 0;
                                                            }
                                                            .qr-code {
                                                                margin: 10px auto;
                                                                width: 120px;
                                                                height: 120px;
                                                            }
                                                            .ticket-data {
                                                                text-align: left;
                                                                margin: 10px 0;
                                                            }
                                                            .ticket-data strong {
                                                                display: inline-block;
                                                                width: 150px;
                                                            }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        <div class="ticket-content">
                                                            <h2>¡Compra Exitosa!</h2>
                                                                                                                        
                                                            <div class="ticket-data">
                                                                <p><strong>Fecha de Compra:</strong> ${formatearFecha(fechaCompra)}</p>
                                                                <p><strong>Tipo de Boleto:</strong>${(ticketQuantities.entradaTipoA > 0 ? 'General' : ticketQuantities.entradaTipoB > 0 ? 'Mexicano' : 'Especial')} </p>
                                                                <p><strong>Total:</strong> $${(ticketQuantities.entradaTipoA * 270 + ticketQuantities.entradaTipoB * 130 + ticketQuantities.entradaTipoC * 65).toFixed(2)}</p>
                                                               

                                                                <p><strong>Fecha de Visita:</strong> ${formatearFecha(fecha)}</p>
                                                                <p><strong>Hora de Visita:</strong> ${formatearHora(fecha)}</p>
                                                                <p><strong>Visitantes:</strong> ${ticketQuantities.entradaTipoA + ticketQuantities.entradaTipoB + ticketQuantities.entradaTipoC}</p>

                                                                <div class="qr-code" id="qrcode"></div>

                                                                <p>Presenta este código a tu llegada</p>
                                                                <p>Un correo con los detalles de tu compra ha sido enviado.</p>

                                                                <p><strong>Tu número de Reservación es:</strong> ${reservationNumber}</p>
                                                                <p>¡Gracias por tu compra!</p>
                                                                
                                                            </div>
                                                                                                                        
                                                            <p>Recuerda visitar www.museocasakahlo.org y entrar a tu cuenta para ver tu historial y fotos, revisar tu aviso de privacidad y términos y condiciones</p>
                                                            
                                                        </div>
                                                        
                                                        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                                                        <script>
                                                            // Generate QR Code
                                                            new QRCode(document.getElementById("qrcode"), {
                                                                text: "${reservationNumber}",
                                                                width: 120,
                                                                height: 120
                                                            });
                                                            
                                                            // Auto-print and close after a short delay
                                                            setTimeout(() => {
                                                                window.print();
                                                                // Close the window after printing (may be blocked by popup blockers)
                                                                setTimeout(() => window.close(), 500);
                                                            }, 500);
                                                        </script>
                                                    </body>
                                                    </html>
                                                `;

                                                        // Write the content and open print dialog
                                                        printWindow.document.open();
                                                        printWindow.document.write(ticketHtml);
                                                        printWindow.document.close();
                                                    }}
                                                >
                                                    Imprimir Ticket
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

        </>
    );
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
const Step1 = ({ fecha, contactInfo = {}, ticketQuantities = { entradaTipoA: 0, entradaTipoB: 0, entradaTipoC: 0 }, reservationNumber = '' }) => {


    return (
        <div className="space-y-6">
            {/* Sección de información de la reserva actual */}
            {fecha && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-md p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                <p className="mb-2">Id de Reservación: {reservationNumber}</p>
                                <p className="mb-2">Cliente: {contactInfo.nombre_cliente}</p>
                                <p className="mb-2">Correo: {contactInfo.correo}</p>
                                <p className="mb-2">No.Boletos: {ticketQuantities.entradaTipoA + ticketQuantities.entradaTipoB + ticketQuantities.entradaTipoC}</p>
                                <p className="mb-2">Fecha y hora actual de la reserva: {formatearFecha(fecha)} a las {formatearHora(fecha)}</p>
                                <p>Total: ${contactInfo.total.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}




        </div>
    );
};


export default ReservacionesImprimirPage;

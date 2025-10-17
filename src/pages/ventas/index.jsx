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
    const [showQR, setShowQR] = useState(false);
    const [reservationId, setReservationId] = useState(null);
    const [clientExist, setClientExist] = useState(null);


    const tourId = 24;


    // Función para generar PDF con información de compra
    const generatePDF = async (reservationData) => {
        try {
            const {
                tourData,
                selectedDate,
                selectedTime,
                ticketQuantities,
                contactInfo,
                reservationId
            } = reservationData;

            // Crear PDF directamente con jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // Función helper para agregar texto centrado
            const addCenteredText = (text, y, size = 12, isBold = false) => {
                pdf.setFontSize(size);
                if (isBold) pdf.setFont('helvetica', 'bold');
                const textWidth = pdf.getTextWidth(text);
                const x = (pageWidth - textWidth) / 2;
                pdf.text(text, x, y);
                if (isBold) pdf.setFont('helvetica', 'normal');
            };

            // Función helper para agregar texto justificado a la izquierda
            const addLeftText = (text, y, size = 10) => {
                pdf.setFontSize(size);
                pdf.text(text, margin, y);
            };

            // Título principal
            addCenteredText(tourData?.nombre || 'Museo de Desarrollo', yPosition, 20, true);
            yPosition += 10;
            addCenteredText('Comprobante de Compra', yPosition, 16, true);
            yPosition += 20;

            // Información de la reservación
            addCenteredText('Información de la Reservación', yPosition, 14, true);
            yPosition += 10;

            const infoData = [
                ['ID de Reservación:', reservationId.toString()],
                ['Fecha:', selectedDate?.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) || ''],
                ['Horario:', selectedTime || ''],
                ['Visitantes:', `${Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0)} personas`]
            ];

            infoData.forEach(([label, value]) => {
                addLeftText(`${label} ${value}`, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // Generar código QR
            try {
                const qrDataURL = await qrcode.toDataURL(reservationId.toString(), {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M'
                });

                console.log('QR generado correctamente');

                // Convertir dataURL a imagen y agregar al PDF
                const qrImage = new Image();
                qrImage.onload = () => {
                    try {
                        // Crear un canvas temporal para convertir la imagen
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = 300;
                        canvas.height = 300;

                        // Dibujar la imagen QR en el canvas
                        ctx.drawImage(qrImage, 0, 0, 300, 300);

                        // Convertir canvas a imagen para jsPDF
                        const qrImageData = canvas.toDataURL('image/png');

                        // Calcular posición para centrar el QR
                        const qrSize = 40; // mm
                        const qrX = (pageWidth - qrSize) / 2;

                        // Agregar el QR al PDF
                        pdf.addImage(qrImageData, 'PNG', qrX, yPosition, qrSize, qrSize);

                        yPosition += qrSize + 10;

                        // Continuar agregando el resto del contenido después del QR
                        addPDFContent();

                    } catch (qrError) {
                        console.error('Error agregando QR al PDF:', qrError);
                        // Continuar sin QR
                        addPDFContent();
                    }
                };

                qrImage.onerror = () => {
                    console.error('Error cargando imagen QR');
                    // Continuar sin QR
                    addPDFContent();
                };

                qrImage.src = qrDataURL;

            } catch (qrGenError) {
                console.error('Error generando QR:', qrGenError);
                // Continuar sin QR
                addPDFContent();
            }

            // Función para agregar el resto del contenido del PDF
            const addPDFContent = () => {
                try {
                    // Detalle de boletos
                    addCenteredText('Detalle de Boletos', yPosition, 14, true);
                    yPosition += 10;

                    // Headers de tabla
                    const colWidths = [60, 25, 30, 35];
                    const headers = ['Tipo', 'Cant.', 'Precio Unit.', 'Subtotal'];
                    let xPos = margin;

                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'bold');
                    headers.forEach((header, i) => {
                        pdf.text(header, xPos, yPosition);
                        xPos += colWidths[i];
                    });

                    yPosition += 8;

                    // Datos de boletos
                    pdf.setFont('helvetica', 'normal');

                    if (ticketQuantities.entradaTipoA > 0) {
                        xPos = margin;
                        pdf.text('Entrada General', xPos, yPosition);
                        xPos += colWidths[0];
                        pdf.text(ticketQuantities.entradaTipoA.toString(), xPos, yPosition);
                        xPos += colWidths[1];
                        pdf.text('$270.00', xPos, yPosition);
                        xPos += colWidths[2];
                        pdf.text(`$${(ticketQuantities.entradaTipoA * 270).toLocaleString('es-MX')}`, xPos, yPosition);
                        yPosition += 6;
                    }

                    if (ticketQuantities.entradaTipoB > 0) {
                        xPos = margin;
                        pdf.text('Ciudadano Mexicano', xPos, yPosition);
                        xPos += colWidths[0];
                        pdf.text(ticketQuantities.entradaTipoB.toString(), xPos, yPosition);
                        xPos += colWidths[1];
                        pdf.text('$130.00', xPos, yPosition);
                        xPos += colWidths[2];
                        pdf.text(`$${(ticketQuantities.entradaTipoB * 130).toLocaleString('es-MX')}`, xPos, yPosition);
                        yPosition += 6;
                    }

                    if (ticketQuantities.entradaTipoC > 0) {
                        xPos = margin;
                        pdf.text('Estudiante / Adulto Mayor / Niño', xPos, yPosition);
                        xPos += colWidths[0];
                        pdf.text(ticketQuantities.entradaTipoC.toString(), xPos, yPosition);
                        xPos += colWidths[1];
                        pdf.text('$65.00', xPos, yPosition);
                        xPos += colWidths[2];
                        pdf.text(`$${(ticketQuantities.entradaTipoC * 65).toLocaleString('es-MX')}`, xPos, yPosition);
                        yPosition += 8;
                    }

                    // Línea separadora
                    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
                    yPosition += 8;

                    // Total
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(12);
                    xPos = pageWidth - margin - pdf.getTextWidth(`$${((ticketQuantities.entradaTipoA * 270) + (ticketQuantities.entradaTipoB * 130) + (ticketQuantities.entradaTipoC * 65)).toLocaleString('es-MX')} MXN`);
                    pdf.text('TOTAL:', pageWidth - margin - 60, yPosition);
                    pdf.text(`$${((ticketQuantities.entradaTipoA * 270) + (ticketQuantities.entradaTipoB * 130) + (ticketQuantities.entradaTipoC * 65)).toLocaleString('es-MX')} MXN`, xPos, yPosition);

                    yPosition += 15;

                    // Información del comprador
                    addCenteredText('Información del Comprador', yPosition, 14, true);
                    yPosition += 10;

                    const compradorData = [
                        [`Nombre: ${contactInfo.nombres} ${contactInfo.apellidos}`],
                        [`Correo: ${contactInfo.correo}`]
                    ];

                    if (contactInfo.telefono) {
                        compradorData.push([`Teléfono: ${contactInfo.telefono}`]);
                    }

                    compradorData.forEach(([text]) => {
                        addLeftText(text, yPosition);
                        yPosition += 6;
                    });

                    yPosition += 10;

                    // Pie de página
                    addCenteredText('Presenta este comprobante junto con el código QR en la entrada del museo.', yPosition, 8);
                    yPosition += 6;
                    addCenteredText(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, yPosition, 8);

                    // Descargar PDF
                    pdf.save(`comprobante-reservacion-${reservationId}.pdf`);
                    toast.success('PDF generado exitosamente');

                } catch (contentError) {
                    console.error('Error agregando contenido al PDF:', contentError);
                    toast.error('Error al generar el PDF');
                }
            };

        } catch (error) {
            console.error('Error generando PDF:', error);
            toast.error('Error al generar el PDF');
        }
    };


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
                // Mostrar código QR con el ID de reservación
                setReservationId(response.data.id_reservacion);
                setClientExist(response.data.clienteExiste);
                setShowQR(true);
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

            {!showQR ? (
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
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep > index + 1 ? 'bg-primary-500 text-white' :
                                                    currentStep === index + 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <span className={`ml-2 text-sm font-medium ${currentStep >= index + 1 ? 'text-primary-600' : 'text-slate-500'
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
            ) : (
                <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="card rounded-lg bg-white dark:bg-slate-800 shadow-base border border-slate-200 dark:border-slate-700">
                            <div className="card-body p-8 text-center">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                        ¡Compra Exitosa!
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Tu reservación ha sido procesada correctamente
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <div className="bg-white dark:bg-slate-700 p-6 rounded-lg  inline-block">
                                        <QRCode
                                            value={reservationId.toString()}
                                            size={200}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        ID de Reservación
                                    </p>
                                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                        {reservationId}
                                    </p>
                                    {clientExist ? (
                                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                            El cliente ya existía en la base de datos
                                        </p>
                                    ) : (
                                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                            El cliente fue dado de alta
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-slate-600 dark:text-slate-300">
                                        Presenta este código QR en la entrada del museo junto con tu identificación.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setShowQR(false);
                                                setReservationId(null);
                                                // Reset form for new purchase
                                                setCurrentStep(1);
                                                setSelectedDate(null);
                                                setTicketQuantities({
                                                    entradaTipoA: 0,
                                                    entradaTipoB: 0,
                                                    entradaTipoC: 0,
                                                });
                                                setSelectedTime('');
                                                setContactInfo({
                                                    nombres: '',
                                                    apellidos: '',
                                                    telefono: '',
                                                    correo: '',
                                                    password: '',
                                                });
                                            }}
                                        >
                                            Hacer Nueva Compra
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                // Generar PDF con información de compra
                                                const reservationData = {
                                                    tourData,
                                                    selectedDate,
                                                    selectedTime,
                                                    ticketQuantities,
                                                    contactInfo,
                                                    reservationId
                                                };
                                                generatePDF(reservationData);
                                            }}
                                        >
                                            Generar PDF
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
    const totalAmount = (ticketQuantities.entradaTipoA * 270) + (ticketQuantities.entradaTipoB * 130) + (ticketQuantities.entradaTipoC * 65);

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
                            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">${totalAmount.toLocaleString('es-MX')} MXN</p>
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

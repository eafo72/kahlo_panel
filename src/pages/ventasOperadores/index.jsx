import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import clienteAxios from '../../configs/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Flatpickr from 'react-flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import qrcode from 'qrcode';
import Swal from 'sweetalert2';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

// Initialize Stripe
let stripePromise;
// Update the getStripe function to use the latest Stripe.js
const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe('pk_live_51S5vt43kq9gDlybwvDJBd6hVCE0XA0l7sXogrP43DCi0nfCBITtHicGPetLzcD86BmYEMrm0Z6YPiW2X8WKwwgr7007hGawoTN', {
            // Ensure we're using the latest API version
            apiVersion: '2023-10-16'
        });
    }
    return stripePromise;
};

//import 'flatpickr/dist/themes/material_red.css';


const VentasPage = () => {
    const userCtx = useContext(UserContext);
    const { user, verifyingToken } = userCtx;
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [tourData, setTourData] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [ticketQuantities, setTicketQuantities] = useState({
        entradaTipoA: 1, // General - Default to 1 ticket
    });
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [contactInfo, setContactInfo] = useState({
        id: '',
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
    const [isPaymentInProgress, setIsPaymentInProgress] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [showCart, setShowCart] = useState(false);

    const tourId = 24;

    // Stripe configuration for operators
    //const STRIPE_PRODUCT = 'price_1StufU3CVvaJXMYXLXkf75Yk'; // Replace with your actual Stripe price ID for operators
    const TICKET_PRICE = 215; // Precio fijo para operadores


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
                        pdf.text('$215.00', xPos, yPosition);
                        xPos += colWidths[2];
                        pdf.text(`$${(ticketQuantities.entradaTipoA * 215).toLocaleString('es-MX')}`, xPos, yPosition);
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
                    xPos = pageWidth - margin - pdf.getTextWidth(`$${((ticketQuantities.entradaTipoA * 215) + (ticketQuantities.entradaTipoB * 130) + (ticketQuantities.entradaTipoC * 65)).toLocaleString('es-MX')} MXN`);
                    pdf.text('TOTAL:', pageWidth - margin - 60, yPosition);
                    pdf.text(`$${((ticketQuantities.entradaTipoA * 215) + (ticketQuantities.entradaTipoB * 130) + (ticketQuantities.entradaTipoC * 65)).toLocaleString('es-MX')} MXN`, xPos, yPosition);

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

    // Track initialization with useRef
    const initialized = useRef(false);

    // Initialize user data only once
    if (!initialized.current) {
        initialized.current = true;

        // Verificar si hay que restaurar el estado del carrito
        const returnToCart = localStorage.getItem('returnToCart');
        const savedCartState = localStorage.getItem('cartState');
        
        if (returnToCart === 'true' && savedCartState) {
            try {
                const cartState = JSON.parse(savedCartState);
                setCartItems(cartState.cartItems || []);
                setCurrentStep(cartState.currentStep || 1);
                setSelectedDate(cartState.selectedDate ? new Date(cartState.selectedDate) : null);
                setSelectedTime(cartState.selectedTime || '');
                setTicketQuantities(cartState.ticketQuantities || { entradaTipoA: 1 });
                setAvailableTimes(cartState.availableTimes || []);
                setContactInfo(prev => ({ ...prev, ...cartState.contactInfo }));
                
                // Limpiar el estado de retorno
                localStorage.removeItem('returnToCart');
                localStorage.removeItem('cartState');
            } catch (error) {
                console.error('Error al restaurar el estado del carrito:', error);
            }
        }

        const token = localStorage.getItem("token");
                
        if (!token) {
            console.log('No token found, redirecting to /');
            navigate("/");
        } else {
        
            (async () => {
                try {
                    const result = await verifyingToken();
                   
                    if (result) {
                        setContactInfo({
                            id: result[0].id || '',
                            nombres: result[0].nombres || '',
                            apellidos: result[0].apellidos || '',
                            telefono: result[0].telefono || '',
                            correo: result[0].correo || '',
                            password: '',
                            saldo: result[0].saldo || 0,
                        });
                    } else {
                        console.log('result is null or undefined');
                    }
                } catch (error) {
                    console.error('Error al cargar los datos del usuario:', error);
                    toast.error('Error al cargar los datos del usuario');
                    navigate("/");
                }
            })();
        }
    }


    // Fetch Tour Data on component mount
    // Verificar si hay una sesión de Stripe en la URL
    useEffect(() => {
        const checkStripeSession = async () => {
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('session_id');
            const balanceLoaded = params.get('balance_loaded');
            const loadedAmount = params.get('amount');

            // Limpiar la URL
            window.history.replaceState({}, document.title, '/ventasOperadores');

            // Verificar si se cargó saldo
            if (balanceLoaded === 'true' && loadedAmount) {
                try {
                    // Mostrar mensaje de éxito
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Saldo cargado exitosamente!',
                        text: `Se han cargado $${parseFloat(loadedAmount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN a tu cuenta.`,
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Continuar'
                    });

                    // Actualizar el saldo del usuario
                    const result = await verifyingToken();
                    if (result) {
                        setContactInfo(prev => ({
                            ...prev,
                            saldo: result[0].saldo || 0
                        }));
                    }
                } catch (error) {
                    console.error('Error al verificar carga de saldo:', error);
                }
            }

            // Verificar si hay una sesión de pago normal
            if (sessionId) {
                try {
                    // Verificar el estado del pago
                    const response = await clienteAxios.get(`/venta/verificar-sesion-stripe?session_id=${sessionId}`);

                    if (response.data.success && response.data.reservacion) {
                        // Mostrar éxito
                        setReservationId(response.data.reservacion.id_reservacion);
                        setClientExist(response.data.reservacion.clienteExiste);
                        setShowQR(true);

                        // Mostrar mensaje de éxito
                        toast.success('¡Pago procesado exitosamente!');
                    } else {
                        throw new Error('No se pudo verificar el pago');
                    }
                } catch (error) {
                    console.error('Error al verificar sesión de Stripe:', error);
                    toast.error('Hubo un error al verificar el pago. Por favor contacta a soporte.');
                }
            }
        };

        checkStripeSession();
    }, []);

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
            [type]: Math.max(1, Math.min(30, prev[type] + amount)) // Keep between 1 and 30
        }));
        
        // Si hay un horario seleccionado, resetearlo al cambiar la cantidad de boletos
        if (selectedTime && selectedTime !== '') {
            setSelectedTime('');
            setAvailableTimes([]);
            toast.info('La cantidad de boletos ha cambiado. Por favor, consulta los horarios disponibles nuevamente.');
        }
    };

    const totalVisitantes = ticketQuantities.entradaTipoA;

    // Función para agregar item al carrito
    const addToCart = () => {
        if (!selectedDate || !selectedTime || totalVisitantes === 0) {
            toast.warn('Debes seleccionar fecha, horario y cantidad de boletos');
            return;
        }

        // Verificar si al agregar este item se excede el límite de 100 boletos por fecha
        const dateKey = selectedDate.toISOString().split('T')[0];
        const currentTicketsForDate = cartItems
            .filter(item => item.date.toISOString().split('T')[0] === dateKey)
            .reduce((total, item) => total + item.quantity, 0);
        
        const newTotalForDate = currentTicketsForDate + totalVisitantes;
        
        if (newTotalForDate > 100) {
            toast.warn(`No puedes agregar más de 100 boletos para el mismo día. Actualmente tienes ${currentTicketsForDate} boletos para esta fecha y estás intentando agregar ${totalVisitantes} más.`);
            return;
        }

        const cartItem = {
            id: Date.now(), // ID único para el item
            date: selectedDate,
            time: selectedTime,
            quantity: totalVisitantes,
            unitPrice: TICKET_PRICE,
            subtotal: totalVisitantes * TICKET_PRICE,
            dateString: selectedDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        setCartItems(prev => [...prev, cartItem]);
        
        // Resetear selección actual
        setSelectedTime('');
        setTicketQuantities({ entradaTipoA: 1 });
        setAvailableTimes([]);
        
        toast.success('Se agregó al carrito correctamente');
    };

    // Función para eliminar item del carrito
    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Se eliminó del carrito');
    };

    // Función para calcular total del carrito
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.subtotal, 0);
    };

    // Función para obtener total de visitantes del carrito
    const getCartTotalVisitors = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const handleCheckHorarios = async () => {
        if (totalVisitantes < 1 || totalVisitantes > 30) {
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
                    //console.log(response);
                    if (response.data?.horarios?.length > 0) {
                        const available = response.data.horarios.filter(h => h.disponible && h.applyForOperator === 1);
                        if (available.length > 0) {
                            setAvailableTimes(response.data.horarios.filter(h => h.applyForOperator === 1));
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



    // Función para resetear el formulario para nueva compra
    const resetFormForNewPurchase = () => {
        // Resetear estados principales
        setCurrentStep(1);
        setSelectedDate(null);
        setSelectedTime('');
        setTicketQuantities({
            entradaTipoA: 0,
        });
        setCartItems([]);
        setShowQR(false);
        setReservationId(null);
        setClientExist(false);
        setIsPaymentInProgress(false);
        
        // Limpiar localStorage
        localStorage.removeItem('cartItems');
        localStorage.removeItem('selectedDate');
        localStorage.removeItem('selectedTime');
        localStorage.removeItem('ticketQuantities');
    };

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
                background-color: #6b7280 !important;
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
            .swal2-popup .swal2-confirm:not([style*="display: none"]):not(.swal2-hidden):hover {
                background-color: #059669 !important;
                opacity: 0.9 !important;
            }
            .swal2-popup .swal2-cancel:not([style*="display: none"]):not(.swal2-hidden):hover {
                background-color: #4b5563 !important;
                opacity: 0.9 !important;
            }
            .swal2-popup .swal2-deny:not([style*="display: none"]):not(.swal2-hidden):hover {
                background-color: #dc2626 !important;
                opacity: 0.9 !important;
            }
            .swal2-popup .swal2-confirm[style*="display: none"],
            .swal2-popup .swal2-cancel[style*="display: none"],
            .swal2-popup .swal2-deny[style*="display: none"],
            .swal2-popup .swal2-confirm.swal2-hidden,
            .swal2-popup .swal2-cancel.swal2-hidden,
            .swal2-popup .swal2-deny.swal2-hidden {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
        `;
        document.head.appendChild(style);
    };

    // Función para manejar la carga de saldo
    const handleLoadBalance = async () => {
        try {
            const { value: amount } = await Swal.fire({
                title: 'Cargar Saldo',
                text: 'Ingresa la cantidad que deseas cargar a tu cuenta',
                input: 'number',
                inputLabel: 'Cantidad (MXN)',
                inputPlaceholder: '100.00',
                inputAttributes: {
                    min: 1,
                    step: 0.01,
                    max: 50000
                },
                inputValidator: (value) => {
                    if (!value || value <= 0) {
                        return 'Debes ingresar una cantidad válida';
                    }
                    if (value > 50000) {
                        return 'La cantidad máxima es $50,000.00 MXN';
                    }
                    return null;
                },
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Cargar Saldo',
                cancelButtonText: 'Cancelar',
                didOpen: () => {
                    applySweetAlertStyles();
                }
            });

            if (amount) {
                // Mostrar loading
                Swal.fire({
                    title: 'Procesando carga de saldo',
                    text: 'Estamos preparando tu pago...',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => { Swal.showLoading(); }
                });

                // Crear sesión de checkout para carga de saldo
                const response = await clienteAxios.post('/venta/stripe/create-balance-session', {
                    amount: parseFloat(amount),
                    customerEmail: contactInfo.correo,
                    successUrl: `${window.location.origin}/ventasOperadores?balance_loaded=true&amount=${amount}`,
                    cancelUrl: `${window.location.origin}/ventasOperadores`,
                    metadata: {
                        flow: 'wallet_topup',
                        customer_id: contactInfo.id,
                        customer_name: contactInfo.nombres + " " + contactInfo.apellidos,
                        customer_email: contactInfo.correo,
                        balance_load: 'true',
                        amount: amount.toString()
                    }
                });

                if (response.data.url) {
                    // Redirigir a Stripe Checkout
                    window.location.href = response.data.url;
                } else {
                    throw new Error('No se pudo iniciar el proceso de carga de saldo');
                }
            }
        } catch (error) {
            console.error('Error al procesar la carga de saldo:', error);
            let errorMessage = 'Ocurrió un error al procesar tu carga de saldo. Por favor, intenta nuevamente.';
            
            if (error.response) {
                errorMessage = error.response.data?.error || error.response.data?.message || error.response.statusText || errorMessage;
            } else if (error.request) {
                errorMessage = 'No se recibió respuesta del servidor. Por favor, verifica tu conexión a internet.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            await Swal.fire({
                icon: 'error',
                title: 'Error al cargar saldo',
                text: errorMessage,
                confirmButtonColor: '#a01e24',
                confirmButtonText: 'Entendido',
                didOpen: applySweetAlertStyles
            });
        }
    };

    // Función para formatear fecha sin problemas de timezone
    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString + 'T00:00:00');
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        const diaSemana = dias[fecha.getUTCDay()];
        const dia = fecha.getUTCDate();
        const mes = meses[fecha.getUTCMonth()];
        const año = fecha.getUTCFullYear();
        
        return `${diaSemana}, ${dia} de ${mes} de ${año}`;
    };

    const handlePayment = async () => {
        try {
            // Deshabilitar botones
            setIsPaymentInProgress(true);

            // Validar que el carrito no esté vacío
            if (cartItems.length === 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Carrito vacío',
                    text: 'Debes agregar al menos un boleto al carrito',
                    confirmButtonColor: '#a01e24',
                    didOpen: applySweetAlertStyles
                });
                return;
            }

            // Validar saldo suficiente
            const totalAmount = getCartTotal();
            if (contactInfo.saldo < totalAmount) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Saldo insuficiente',
                    text: `No tienes saldo suficiente para realizar esta compra. Saldo disponible: $${contactInfo.saldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN. Total requerido: $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
                    confirmButtonColor: '#a01e24',
                    didOpen: applySweetAlertStyles
                });
                return;
            }

            // Validar que se compren mínimo 10 boletos en total y máximo 100 boletos por fecha
            const totalTickets = getCartTotalVisitors();
            
            if (totalTickets < 10) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Cantidad mínima requerida',
                    text: `Necesitas comprar al menos 10 boletos en total. Actualmente tienes ${totalTickets} boletos.`,
                    confirmButtonColor: '#a01e24',
                    didOpen: applySweetAlertStyles
                });
                return;
            }

            // Validar máximo 100 boletos por fecha
            const ticketsByDate = {};
            cartItems.forEach(item => {
                const dateKey = item.date.toISOString().split('T')[0];
                if (!ticketsByDate[dateKey]) {
                    ticketsByDate[dateKey] = 0;
                }
                ticketsByDate[dateKey] += item.quantity;
            });

            for (const [date, ticketsForDate] of Object.entries(ticketsByDate)) {
                if (ticketsForDate > 100) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Cantidad máxima excedida',
                        text: `Para el día ${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} el máximo permitido es de 100 boletos. Actualmente tienes ${ticketsForDate} boletos.`,
                        confirmButtonColor: '#a01e24',
                        didOpen: applySweetAlertStyles
                    });
                    return;
                }
            }

            // Validar datos requeridos
            if (!contactInfo.nombres || !contactInfo.correo) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Datos incompletos',
                    text: 'Por favor completa todos los campos requeridos',
                    confirmButtonColor: '#a01e24',
                    didOpen: applySweetAlertStyles
                });
                return;
            }

            // Verificar disponibilidad para cada item del carrito
            for (const item of cartItems) {
                const formattedDate = item.date.toISOString().split('T')[0];
                const disponibilidad = await clienteAxios.get(`/venta/horarios/${tourId}/fecha/${formattedDate}/boletos/${item.quantity}`);
               
                const horarioSeleccionado = disponibilidad.data?.horarios?.find(h => h.hora_salida === item.time);
                if (!horarioSeleccionado || !horarioSeleccionado.disponible) {
                    const lugaresDisponibles = horarioSeleccionado?.lugares_disp || 0;
                    await Swal.fire({
                        icon: 'error',
                        title: 'No hay disponibilidad',
                        text: `No hay suficientes boletos disponibles para ${item.dateString} a las ${item.time}. Lugares disponibles: ${lugaresDisponibles}`,
                        confirmButtonColor: '#a01e24',
                        didOpen: applySweetAlertStyles
                    });
                    return;
                }
            }

            // Mostrar loading
            Swal.fire({
                title: 'Procesando compra',
                text: 'Estamos procesando tu compra con saldo...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => { Swal.showLoading(); }
            });

            // Preparar datos para la API
            const totalVisitors = getCartTotalVisitors();
            
            // Preparar los items del carrito para el backend
            const cartItemsForBackend = cartItems.map(item => ({
                fecha_ida: item.date.toISOString().split('T')[0],
                horaCompleta: item.time,
                boletos: item.quantity,
                subtotal: item.subtotal,
                tipos_boletos: JSON.stringify({ 
                    tipoA: item.quantity, // Cada item usa su propia cantidad
                    tipoB: 0, 
                    tipoC: 0, 
                    tipoD: 0 
                })
            }));

            // Enviar información de compra a la API para procesar con saldo
            const response = await clienteAxios.post('/venta/crear-touroperador', {
                "no_boletos": parseInt(totalVisitors),
                "cart_items": JSON.stringify(cartItemsForBackend),
                "nombre_cliente": contactInfo.nombres + " " + contactInfo.apellidos,
                "cliente_id": contactInfo.id,
                "correo": contactInfo.correo,
                "telefono": contactInfo.telefono,
                "tourId": tourId,
                "total": totalAmount,
                "payment_method": "balance"
            });
            
            if (response.data && response.data.reservaciones && response.data.reservaciones.length > 0) {
                const idReservacion = response.data.reservaciones[0].id_reservacion;
                const reservaciones = response.data.reservaciones;
                const totalDescontado = response.data.total_descontado || 0;
                const saldoRestante = response.data.saldo_restante || 0;
                
                // Mostrar éxito con las reservaciones
                await Swal.fire({
                    icon: 'success',
                    title: '¡Compra Exitosa!',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>Tu compra ha sido procesada exitosamente.</strong></p>
                            <p><strong>Reservaciones creadas:</strong></p>
                            ${reservaciones.map((res, index) => `
                                <div style="background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px;">
                                    <p><strong>ID Reservación:</strong> ${res.id_reservacion || 'N/A'}</p>
                                    <p><strong>Fecha:</strong> ${res.fecha_ida ? formatearFecha(res.fecha_ida) : 'N/A'}</p>
                                    <p><strong>Hora:</strong> ${res.horaCompleta || 'N/A'}</p>
                                    <p><strong>Boletos:</strong> ${res.boletos || res.total_boletos || 'N/A'}</p>
                                </div>
                            `).join('')}
                            <div style="background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #10b981;">
                                <p><strong>Total descontado:</strong> $${totalDescontado.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</p>
                                <p><strong>Saldo restante:</strong> $${saldoRestante.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</p>
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'Hacer Nueva Compra',
                    didOpen: applySweetAlertStyles
                });
                
                // Actualizar saldo del usuario con el saldo restante de la API
                setContactInfo(prev => ({ ...prev, saldo: saldoRestante }));
                
                // Resetear el formulario para nueva compra
                resetFormForNewPurchase();
                
            } else {
                throw new Error('No se recibió una respuesta válida del servidor');
            }
            
        } catch (error) {
            console.error('Error al procesar la compra con saldo:', error);
            let errorMessage = 'Ocurrió un error al procesar tu compra. Por favor, intenta nuevamente.';
            
            // Handle different types of errors
            if (error.response) {
                // Server responded with an error status code (4xx, 5xx)
                const errorData = error.response.data;
                
                // Manejar errores específicos de disponibilidad
                if (errorData.error && errorData.msg && errorData.msg.includes('disponibilidad')) {
                    if (errorData.item_sin_disponibilidad) {
                        const item = errorData.item_sin_disponibilidad;
                        errorMessage = `
                            <div style="text-align: left;">
                                <p><strong>No hay suficientes boletos disponibles:</strong></p>
                                <p><strong>Fecha:</strong> ${new Date(item.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p><strong>Hora:</strong> ${item.hora || item.horaCompleta || 'N/A'}</p>
                                <p><strong>Boletos solicitados:</strong> ${item.boletos_solicitados}</p>
                                <p><strong>Disponibilidad actual:</strong> ${item.disponibilidad_actual} boletos</p>
                                <p style="color: #dc2626; margin-top: 10px;"><strong>Por favor, reduce la cantidad de boletos o selecciona otro horario.</strong></p>
                            </div>
                        `;
                    } else {
                        errorMessage = errorData.msg || 'No hay disponibilidad suficiente para los boletos solicitados.';
                    }
                } else {
                    errorMessage = errorData.error || errorData.message || errorData.msg || errorMessage;
                }
            } else if (error.request) {
                // Request was made but no response was received
                errorMessage = 'No se recibió respuesta del servidor. Por favor, verifica tu conexión a internet.';
            } else if (error.message) {
                // Something happened in setting up the request
                errorMessage = error.message;
            }
            
            // Show error message
            await Swal.fire({
                icon: 'error',
                title: 'Error al procesar la compra',
                html: errorMessage,
                confirmButtonColor: '#a01e24',
                confirmButtonText: 'Entendido',
                didOpen: applySweetAlertStyles
            });
        } finally {
            setIsPaymentInProgress(false);
        }
    };

    const nextStep = () => {
        // Validations
        if (currentStep === 1 && !selectedDate) {
            return toast.warn('Selecciona una fecha');
        }
        if (currentStep === 2) {
            // Permitir continuar si hay items en el carrito O si hay boletos seleccionados y horario elegido
            const hasCartItems = cartItems.length > 0;
            const hasBoletos = ticketQuantities.entradaTipoA > 0;
            const hasHorario = selectedTime && selectedTime !== '' && selectedTime !== null;
            const hasSelection = hasBoletos && hasHorario;
            
            console.log('Validación paso 2:', {
                currentStep,
                cartItemsLength: cartItems.length,
                hasCartItems,
                selectedTime,
                ticketQuantities,
                hasBoletos,
                hasHorario,
                hasSelection,
                entradaTipoA: ticketQuantities.entradaTipoA,
                availableTimes,
                availableTimesLength: availableTimes.length
            });
            
            if (!hasCartItems && !hasSelection) {
                // Mensaje específico según lo que falta
                if (!hasHorario) {
                    return toast.warn('Debes seleccionar un horario para continuar');
                } else if (!hasBoletos) {
                    return toast.warn('Debes seleccionar al menos un boleto para continuar');
                } else {
                    return toast.warn('Debes seleccionar horario y boletos para continuar');
                }
            }
        }
        if (currentStep === 3) {
            if (cartItems.length === 0) return toast.warn('El carrito está vacío');
        }
        if (currentStep === 4) {
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
                return <Step2 ticketQuantities={ticketQuantities} handleQtyChange={handleQtyChange} availableTimes={availableTimes} selectedTime={selectedTime} setSelectedTime={setSelectedTime} handleCheckHorarios={handleCheckHorarios} addToCart={addToCart} cartItems={cartItems} setCurrentStep={setCurrentStep} />;
            case 3:
                return <StepCart cartItems={cartItems} removeFromCart={removeFromCart} getCartTotal={getCartTotal} getCartTotalVisitors={getCartTotalVisitors} setShowCart={setShowCart} />;
            case 4:
                return <Step3 contactInfo={contactInfo} setContactInfo={setContactInfo} isLogin={isLogin} setIsLogin={setIsLogin} />;
            case 5:
                return <Step4 tourData={tourData} cartItems={cartItems} contactInfo={contactInfo} getCartTotal={getCartTotal} getCartTotalVisitors={getCartTotalVisitors} />;
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
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                                <div className="flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Saldo disponible</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            ${contactInfo.saldo ? contactInfo.saldo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} MXN
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-6">
                                <div className="flex justify-center items-center gap-4 my-6">
                                    {['Fecha', 'Boletos', 'Carrito', 'Datos', 'Resumen'].map((label, index) => (
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
                                            {currentStep < 5 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={nextStep}
                                                >
                                                    Siguiente →
                                                </button>
                                            )}
                                            {currentStep === 5 && (
                                                <>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <button
                                                            type="button"
                                                            className={`btn btn-outline-success ${stripeLoading ? 'btn-disabled' : ''}`}
                                                            onClick={handleLoadBalance}
                                                            disabled={stripeLoading}
                                                        >
                                                            {stripeLoading ? 'Procesando...' : 'Cargar Saldo'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`btn btn-primary ${stripeLoading ? 'btn-disabled' : ''}`}
                                                            onClick={handlePayment}
                                                            disabled={stripeLoading}
                                                        >
                                                            {stripeLoading ? 'Procesando...' : 'Pagar'}
                                                        </button>
                                                    </div>
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
                                                    entradaTipoA: 1,
                                                });
                                                setSelectedTime('');
                                                setAvailableTimes([]);
                                                setCartItems([]);
                                                setContactInfo({
                                                    id: '',
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
                                                                <p><strong>Fecha de Compra:</strong> ${new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                                                                <p><strong>Tipo de Boleto:</strong> General</p>
                                                                <p><strong>Total:</strong> ${getCartTotal().toFixed(2)}</p>

                                                                <p><strong>Detalles de la compra:</strong></p>
                                                                {cartItems.map((item, index) => (
                                                                    <p key={item.id}>
                                                                        • {item.dateString} - {item.time} - {item.quantity} personas
                                                                    </p>
                                                                ))}
                                                                <p><strong>Total de Visitantes:</strong> {getCartTotalVisitors()}</p>

                                                                <div class="qr-code" id="qrcode"></div>

                                                                <p>Presenta este código a tu llegada</p>
                                                                <p>Un correo con los detalles de tu compra ha sido enviado.</p>

                                                                <p><strong>Tu número de Reservación es:</strong> ${reservationId}</p>
                                                                <p>¡Gracias por tu compra!</p>
                                                                
                                                            </div>
                                                                                                                        
                                                            <p>Recuerda visitar www.museocasakahlo.org y entrar a tu cuenta para ver tu historial y fotos, revisar tu aviso de privacidad y términos y condiciones</p>
                                                            
                                                        </div>
                                                        
                                                        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                                                        <script>
                                                            // Generate QR Code
                                                            new QRCode(document.getElementById("qrcode"), {
                                                                text: "${reservationId}",
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
    const raw = tourData ? tourData['fechas_no_disponibles'] : "";

    const arrayFechas = raw
        .split(";")
        .filter(f => f !== "")
        .map(f => {
            const [d, m, y] = f.split("-");
            return new Date(y, m - 1, d); // mes -1 porque JS empieza en 0
        });

    const calendarOptions = {
        inline: true,
        locale: Spanish,
        dateFormat: "d/m/Y",
        minDate: "today",
        disable: [
            (date) => date.getDay() === 2, // Disable Tuesdays
            ...arrayFechas
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
const Step2 = ({ ticketQuantities, handleQtyChange, availableTimes, selectedTime, setSelectedTime, handleCheckHorarios, addToCart, cartItems, setCurrentStep }) => (
    <div className="space-y-6">
        <div className="text-center">
            <h4 className="card-title text-slate-900 dark:text-white">Selecciona cantidad y horario</h4>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Elige la cantidad de boletos y consulta horarios disponibles</p>
        </div>

        {/* Single Ticket Type for Operators */}
        <div className="text-center py-4">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Entrada General</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">$215.00 MXN</p>
            <div className="flex items-center justify-center mt-4 space-x-4">
                <button
                    type="button"
                    onClick={() => handleQtyChange('entradaTipoA', -1)}
                    className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                    disabled={ticketQuantities.entradaTipoA <= 1}
                >
                    -
                </button>
                <span className="text-xl font-medium w-12 text-center">{ticketQuantities.entradaTipoA}</span>
                <button
                    type="button"
                    onClick={() => handleQtyChange('entradaTipoA', 1)}
                    className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                    disabled={ticketQuantities.entradaTipoA >= 10}
                >
                    +
                </button>
            </div>
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
                        key={selectedTime} // Forzar re-renderizado cuando cambia selectedTime
                        id="horario"
                        className="form-control bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:border-slate-200 dark:disabled:border-slate-600"
                        value={selectedTime}
                        onChange={(e) => {
                    console.log('Select onChange:', {
                        value: e.target.value,
                        previousValue: selectedTime,
                        type: typeof e.target.value
                    });
                    setSelectedTime(e.target.value);
                }}
                        disabled={availableTimes.length === 0}
                    >
                        <option value="" disabled>-- Elige un horario --</option>

                        {availableTimes.map(horario => (
                            <option
                                key={horario.hora_salida}
                                value={horario.hora_salida}
                                disabled={!horario.disponible}
                            >
                                {horario.hora_salida}
                                {!horario.disponible ? ` (${horario.lugares_disp} disponibles)` : ''}
                                {horario.idioma ? ` - ${horario.idioma}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botón para agregar al carrito y botón para continuar */}
                {selectedTime && (
                    <div className="mt-4 space-y-3">
                        <button
                            type="button"
                            onClick={addToCart}
                            className="btn btn-success w-full"
                        >
                            Agregar al Carrito →
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    if (cartItems.length > 0) {
                                        setCurrentStep(3); // Ir al carrito
                                    } else {
                                        toast.warn('El carrito está vacío. Agrega al menos un boleto primero.');
                                    }
                                }}
                                className="btn btn-outline-primary"
                                disabled={cartItems.length === 0}
                            >
                                {cartItems.length > 0 ? `Ver mi Carrito (${cartItems.length} items)` : 'Carrito vacío'}
                            </button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                            Puedes agregar más fechas y horarios o continuar al carrito
                        </p>
                    </div>
                )}

                {/* Botón para ir al carrito incluso sin selección */}
                {cartItems.length > 0 && !selectedTime && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 text-center">
                            Ya tienes {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} en tu carrito
                        </p>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="btn btn-primary w-full"
                        >
                            Ir al Carrito y Continuar →
                        </button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                            O selecciona más fechas/horarios si lo deseas
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// Step 3: Cart View
const StepCart = ({ cartItems, removeFromCart, getCartTotal, getCartTotalVisitors }) => {
    // Calculate tickets by date for validation display
    const ticketsByDate = {};
    cartItems.forEach(item => {
        const dateKey = item.date.toISOString().split('T')[0];
        if (!ticketsByDate[dateKey]) {
            ticketsByDate[dateKey] = {
                dateString: item.dateString,
                total: 0,
                items: []
            };
        }
        ticketsByDate[dateKey].total += item.quantity;
        ticketsByDate[dateKey].items.push(item);
    });

    if (cartItems.length === 0) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h4 className="card-title text-slate-900 dark:text-white">Tu Carrito</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">Tu carrito está vacío</p>
                </div>
                <div className="card border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="card-body text-center py-8">
                        <p className="text-slate-600 dark:text-slate-300">No has agregado ningún boleto al carrito</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Regresa a la sección anterior para agregar boletos</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Recuerda: Mínimo 10 boletos en total, máximo 100 boletos por fecha</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h4 className="card-title text-slate-900 dark:text-white">Tu Carrito</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Revisa tus selecciones antes de continuar</p>
            </div>

            {/* Validación por fecha */}
            <div className="space-y-3">
                {/* Validación total general */}
                {getCartTotalVisitors() < 10 && (
                    <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-600">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Total General</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Total de boletos: <span className="font-bold">{getCartTotalVisitors()}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                    ❌ Mínimo 10 boletos en total
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Validación por cada fecha - solo mostrar si hay advertencias */}
                {Object.entries(ticketsByDate).map(([dateKey, dateInfo]) => {
                    const isAboveMax = dateInfo.total > 100;
                    
                    // Solo mostrar el recuadro si hay una advertencia
                    if (!isAboveMax) return null;
                    
                    return (
                        <div key={dateKey} className="p-4 rounded-lg border bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-600">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{dateInfo.dateString}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        Boletos para esta fecha: <span className="font-bold">{dateInfo.total}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                        ❌ Máximo 100 boletos
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="card border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h5 className="font-semibold text-slate-900 dark:text-white mb-2">
                                        {item.dateString}
                                    </h5>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-slate-600 dark:text-slate-300">
                                            <span className="font-medium">Horario:</span> {item.time}
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            <span className="font-medium">Visitantes:</span> {item.quantity} personas
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            <span className="font-medium">Precio unitario:</span> ${item.unitPrice} MXN
                                        </p>
                                        <p className="text-primary-600 dark:text-primary-400 font-semibold">
                                            Subtotal: ${item.subtotal.toLocaleString('es-MX')} MXN
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="btn btn-outline-danger btn-sm"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card border-2 border-primary-500 dark:border-primary-400 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <div className="card-body p-6">
                    <div className="text-center">
                        <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Total del Carrito</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                            {getCartTotalVisitors()} visitantes en {cartItems.length} fechas
                        </p>
                        <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            ${getCartTotal().toLocaleString('es-MX')} MXN
                        </p>
                        <div className="mt-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                ⚠️ Recuerda: Mínimo 10 boletos en total, máximo 100 boletos por fecha
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                                className="form-control bg-gray-100"
                                value={contactInfo.nombres}
                                readOnly
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
                                className="form-control bg-gray-100"
                                value={contactInfo.apellidos}
                                readOnly
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
                                className="form-control bg-gray-100"
                                value={contactInfo.telefono}
                                readOnly
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
                                className="form-control bg-gray-100"
                                value={contactInfo.correo}
                                readOnly
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
const Step4 = ({ tourData, cartItems, contactInfo, getCartTotal, getCartTotalVisitors }) => {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h4 className="card-title text-slate-900 dark:text-white">Resumen de tu reservación</h4>
                <p className="text-slate-600 dark:text-slate-300 mt-2">Revisa todos los detalles antes de confirmar tu compra</p>
            </div>

            <div className="card border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="card-body space-y-4">
                    <SummaryRow label="Tipo de experiencia" value={tourData?.nombre || ''} />
                    
                    {/* Mostrar todos los items del carrito */}
                    {cartItems.map((item, index) => (
                        <div key={item.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                            <h6 className="font-semibold text-slate-900 dark:text-white mb-2">
                                Entrada {index + 1}
                            </h6>
                            <SummaryRow label="Fecha" value={item.dateString} />
                            <SummaryRow label="Horario" value={item.time} />
                            <SummaryRow label="Visitantes" value={`${item.quantity} personas`} />
                            <SummaryRow label="Subtotal" value={`$${item.subtotal.toLocaleString('es-MX')} MXN`} />
                        </div>
                    ))}

                    <SummaryRow label="Titular" value={`${contactInfo.nombres} ${contactInfo.apellidos}`} />
                    <SummaryRow label="Correo de contacto" value={contactInfo.correo} />

                    <div className="border-2 border-primary-500 dark:border-primary-400 rounded-lg p-6 bg-primary-50 dark:bg-primary-900/20">
                        <div className="text-center">
                            <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Total a Pagar</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                                {getCartTotalVisitors()} visitantes en {cartItems.length} fechas
                            </p>
                            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">${getCartTotal().toLocaleString('es-MX')} MXN</p>
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

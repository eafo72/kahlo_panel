import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clienteAxios from '../../configs/axios';
import Swal from 'sweetalert2';

const Finalizada = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const verifySession = async () => {
            const sessionId = searchParams.get('session_id');

            if (!sessionId) {
                setError('No se encontró el ID de sesión');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Show loading
                Swal.fire({
                    title: 'Verificando pago...',
                    text: 'Confirmando los detalles de tu compra',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Verify session with backend
                const response = await clienteAxios.get(`/venta/stripe/session-operator/${sessionId}`);

                console.log(response.data);

                if (response.status === 200 && response.data?.data?.length > 0) {
                    setReservations(response.data.data);

                    Swal.fire({
                        icon: 'success',
                        title: '¡Pago Confirmado!',
                        text: 'Tu pago ha sido procesado exitosamente',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error('No se pudo verificar la sesión');
                }
            } catch (error) {
                console.error('Error al verificar sesión:', error);
                setError('Error al verificar el pago');

                Swal.fire({
                    icon: 'warning',
                    title: 'Verificación pendiente',
                    text: 'No se pudo verificar el pago en este momento, pero tu compra fue procesada',
                    confirmButtonText: 'Continuar'
                });
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando tu pago...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/ventasOperadores'}
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Volver a la página de ventas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8 sm:p-10">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Completado!</h1>
                        <p className="text-gray-600 mb-8">Tu reservación ha sido confirmada exitosamente</p>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">¡Reservación Exitosa!</h2>

                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-2">Número de boletos:</p>
                                <p className="text-2xl font-bold text-blue-600">{reservations.length}</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-2">Números de reservación:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {reservations.map((reservation, index) => (
                                        <div
                                            key={reservation.id_reservacion}
                                            className="bg-gray-50 p-3 rounded-md border border-gray-200"
                                        >
                                            <p className="font-medium text-gray-900">
                                                Boleto {index + 1}: <span className="text-blue-600">{reservation.id_reservacion}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-500">
                                    Fecha de la reservación: {new Date().toLocaleDateString('es-MX', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10">
                            <div className="mt-4">
                                <a
                                    href="/ventasOperadores"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Volver a la página de ventas
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finalizada;
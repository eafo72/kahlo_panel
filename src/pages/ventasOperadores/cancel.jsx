import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from "@/components/ui/Button";
import clienteAxios from '../../configs/axios';
import Swal from 'sweetalert2';

const CancelPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            cancelarCompra(sessionId);
        } else {
            setIsProcessing(false);
            setStatus('no_session');
        }
    }, []);

    const cancelarCompra = async (sessionId) => {
        try {
            const response = await clienteAxios.post('/venta/stripe/cancelar-compra-operator', { sessionId });
            
            if (response.status === 200 && response.data) {
                console.log('Compra cancelada exitosamente:', response.data);
                setStatus('success');
                return response.data.msg;
            } else {
                throw new Error('No se pudo cancelar la compra');
            }
        } catch (error) {
            console.error('Error al intentar cancelar la compra:', error);
            setStatus('error');
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBackToCheckout = () => {
        navigate('/ventasOperadores');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {isProcessing ? (
                    <div className="space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Procesando cancelación...</h2>
                        <p className="text-gray-600">Estamos procesando tu solicitud de cancelación.</p>
                    </div>
                ) : status === 'success' ? (
                    <>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                            <svg 
                                className="h-8 w-8 text-red-600" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                            Pago Cancelado
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Tu pago ha sido cancelado exitosamente.
                        </p>
                        <p className="mt-1 text-gray-600">
                            No se ha realizado ningún cargo a tu tarjeta.
                        </p>
                    </>
                ) : status === 'no_session' ? (
                    <>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                            <svg 
                                className="h-8 w-8 text-yellow-600" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                                />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                            Sesión no encontrada
                        </h2>
                        <p className="mt-2 text-gray-600">
                            No se encontró información de la sesión de pago.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                            <svg 
                                className="h-8 w-8 text-red-600" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-2xl font-bold text-gray-900">
                            Error al cancelar
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Ocurrió un error al intentar cancelar el pago.
                        </p>
                    </>
                )}

                <div className="mt-6">
                    <Button
                        onClick={handleBackToCheckout}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Procesando...' : 'Volver a la página de ventas'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CancelPage;
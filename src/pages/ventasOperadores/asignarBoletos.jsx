// src/pages/ventasOperadores/asignarBoletos.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clienteAxios from "../../configs/axios";
import Swal from "sweetalert2";

const AsignarBoletos = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [boletos, setBoletos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarBoletos = async () => {
            try {
                const response = await clienteAxios.get(`/venta/boletos-por-session/${sessionId}`);
                setBoletos(response.data.data.map(boleto => ({
                    ...boleto,
                    nombre_cliente: '',
                    correo: ''
                })));
            } catch (error) {
                console.error('Error al cargar boletos:', error);
                Swal.fire('Error', 'No se pudieron cargar los boletos', 'error');
            } finally {
                setLoading(false);
            }
        };

        cargarBoletos();
    }, [sessionId]);

    const handleInputChange = (index, field, value) => {
        const nuevosBoletos = [...boletos];
        nuevosBoletos[index] = {
            ...nuevosBoletos[index],
            [field]: value
        };
        setBoletos(nuevosBoletos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que todos los campos estén llenos
        const boletosIncompletos = boletos.some(boleto =>
            !boleto.nombre_cliente?.trim() || !boleto.correo?.trim()
        );
        if (boletosIncompletos) {
            return Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, completa todos los campos de nombre y correo para cada boleto',
                confirmButtonText: 'Entendido'
            });
        }
        // Validar formato de correo electrónico
        const correoInvalido = boletos.some(boleto => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return !emailRegex.test(boleto.correo.trim());
        });
        if (correoInvalido) {
            return Swal.fire({
                icon: 'warning',
                title: 'Correo inválido',
                text: 'Por favor, ingresa un correo electrónico válido para cada boleto',
                confirmButtonText: 'Entendido'
            });
        }

        try {
            await clienteAxios.put(`/venta/asignar-boletos/${sessionId}`, {
                boletos: boletos.map(b => ({
                    id: b.id,
                    nombre_cliente: b.nombre_cliente,
                    correo: b.correo
                }))
            });

            await Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'La información de los boletos ha sido actualizada',
                timer: 2000,
                showConfirmButton: false
            });

            navigate('/ventasOperadores/historial');
        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire('Error', 'No se pudo guardar la información', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Asignar Boletos</h1>

                <form onSubmit={handleSubmit}>
                    {boletos.map((boleto, index) => (
                        <div key={boleto.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Boleto #{index + 1} - {boleto.id_reservacion}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={boleto.nombre_cliente}
                                        onChange={(e) => handleInputChange(index, 'nombre_cliente', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={boleto.correo}
                                        onChange={(e) => handleInputChange(index, 'correo', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/ventasOperadores/historial')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AsignarBoletos;
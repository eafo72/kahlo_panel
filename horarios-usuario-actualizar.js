app.post('/horarios-usuario-actualizar', async (req, res) => {
    try {
        const { id, id_usuario, dia_semana, hora_entrada, hora_salida, tolerancia_minutos, descanso } = req.body;

        // Validar campos requeridos
        if (!id || !id_usuario || dia_semana === undefined) {
            return res.status(400).json({
                error: true,
                message: 'Se requiere id, id_usuario y dia_semana'
            });
        }

        const connection = await db.pool.getConnection();
        await connection.beginTransaction();

        try {
            // Verificar que el horario existe y pertenece al usuario
            const [existingHorario] = await connection.query(
                'SELECT * FROM horarios_semanales WHERE id = ? AND id_usuario = ?',
                [id, id_usuario]
            );

            if (existingHorario.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    error: true,
                    message: 'Horario no encontrado o no pertenece al usuario'
                });
            }

            // Validar que dia_semana esté entre 1 y 7
            if (dia_semana < 1 || dia_semana > 7) {
                await connection.rollback();
                return res.status(400).json({
                    error: true,
                    message: 'dia_semana debe estar entre 1 (Lunes) y 7 (Domingo)'
                });
            }

            // Determinar si es día laboral o de descanso
            const activo = descanso === 0 ? 1 : 0;

            // Validar campos según si es día laboral
            if (activo === 1) {
                if (!hora_entrada || !hora_salida || hora_entrada.trim() === '' || hora_salida.trim() === '') {
                    await connection.rollback();
                    return res.status(400).json({
                        error: true,
                        message: 'Los días laborales requieren hora_entrada y hora_salida'
                    });
                }
            } else {
                // Si es día de descanso, las horas pueden ser vacías o nulas
                hora_entrada = hora_entrada && hora_entrada.trim() !== '' ? hora_entrada : null;
                hora_salida = hora_salida && hora_salida.trim() !== '' ? hora_salida : null;
            }

            // Actualizar el horario
            await connection.query(
                `UPDATE horarios_semanales 
                 SET hora_entrada = ?, hora_salida = ?, tolerancia_minutos = ?, descanso = ?, activo = ?, updated_at = NOW()
                 WHERE id = ? AND id_usuario = ?`,
                [hora_entrada, hora_salida, tolerancia_minutos || 15, descanso, activo, id, id_usuario]
            );

            await connection.commit();

            // Obtener el horario actualizado para devolverlo
            const [updatedHorario] = await connection.query(
                'SELECT hs.*, d.nombre as nombre_dia FROM horarios_semanales hs ' +
                'INNER JOIN dias_semana d ON hs.dia_semana = d.dia_semana ' +
                'WHERE hs.id = ?',
                [id]
            );

            return res.json({
                error: false,
                message: 'Horario actualizado exitosamente',
                horario: updatedHorario[0]
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error actualizando horario:', error);
            return res.status(500).json({
                error: true,
                message: 'Error actualizando el horario',
                details: error.message
            });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error en horarios-usuario-actualizar:', error);
        return res.status(500).json({
            error: true,
            message: 'Error interno del servidor',
            details: error.message
        });
    }
});

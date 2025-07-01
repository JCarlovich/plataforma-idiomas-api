const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');
const { generarResumenClase } = require('../services/gemini');

// 📍 ENDPOINT 1: CREAR CLASE CON VIDEOLLAMADA
router.post('/crear-clase', async (req, res) => {
  try {
    console.log('📞 Creando nueva clase...');
    
    const { profesorId, alumnoEmail, nombreAlumno } = req.body;

    if (!profesorId || !alumnoEmail || !nombreAlumno) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: profesorId, alumnoEmail, nombreAlumno'
      });
    }

    // Generar sala única de Jitsi Meet
    const roomId = `clase-${profesorId}-${Date.now()}`;
    const videoUrl = `https://meet.jit.si/${roomId}`;

    console.log(`🎬 Sala de video creada: ${roomId}`);

    // Guardar en base de datos usando video_classes
    const { data, error } = await supabase
      .from('video_classes')
      .insert([{
        teacher_id: profesorId,
        student_name: nombreAlumno,
        student_email: alumnoEmail,
        video_room_url: videoUrl,
        room_id: roomId,
        status: 'programada',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('❌ Error guardando en BD:', error);
      throw error;
    }

    console.log('✅ Clase guardada exitosamente');

    res.json({
      success: true,
      message: 'Clase creada exitosamente',
      sessionId: data[0].id,
      videoUrl: videoUrl,
      roomId: roomId,
      alumno: nombreAlumno
    });

  } catch (error) {
    console.error('💥 Error creando clase:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear clase'
    });
  }
});

// 📍 ENDPOINT 2: OBTENER INFO DE UNA CLASE
router.get('/clase/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`🔍 Buscando clase: ${roomId}`);

    const { data, error } = await supabase
      .from('video_classes')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        error: 'Clase no encontrada'
      });
    }

    console.log('✅ Clase encontrada');
    res.json({
      success: true,
      clase: data
    });

  } catch (error) {
    console.error('💥 Error obteniendo clase:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// 📍 ENDPOINT 3: INICIAR CLASE
router.post('/iniciar-clase/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`▶️ Iniciando clase: ${roomId}`);

    const { data, error } = await supabase
      .from('video_classes')
      .update({
        status: 'en_curso',
        started_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .select();

    if (error) throw error;

    console.log('✅ Clase marcada como iniciada');
    res.json({
      success: true,
      message: 'Clase iniciada',
      clase: data[0]
    });

  } catch (error) {
    console.error('💥 Error iniciando clase:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// 📍 ENDPOINT 4: FINALIZAR CLASE Y PROCESAR CON IA
router.post('/finalizar-clase', async (req, res) => {
  try {
    console.log('🏁 Finalizando clase y procesando con IA...');
    
    const { 
      sessionId,
      temasTratados,
      vocabularioNuevo,
      dificultadesObservadas,
      notasProfesor,
      nivelEstudiante
    } = req.body;

    if (!sessionId || !temasTratados) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: sessionId, temasTratados'
      });
    }

    // Obtener información de la sesión
    console.log(`🔍 Obteniendo datos de sesión: ${sessionId}`);
    const { data: session, error: sessionError } = await supabase
      .from('video_classes')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    console.log('🤖 Enviando datos a la IA para procesar...');

    // Generar contenido con IA
    const contenidoIA = await generarResumenClase({
      nombreEstudiante: session.student_name,
      nivelEstudiante,
      temasTratados,
      vocabularioNuevo,
      dificultadesObservadas,
      notasProfesor
    });

    console.log('💾 Guardando contenido generado por IA...');

    // Actualizar sesión con contenido de IA
    const { data, error } = await supabase
      .from('video_classes')
      .update({
        status: 'completada',
        ended_at: new Date().toISOString(),
        topics_covered: temasTratados,
        new_vocabulary: vocabularioNuevo,
        difficulties_observed: dificultadesObservadas,
        teacher_notes: notasProfesor,
        student_level: nivelEstudiante,
        ai_content: JSON.stringify(contenidoIA)
      })
      .eq('id', sessionId)
      .select();

    if (error) throw error;

    console.log('🎉 Clase finalizada y procesada exitosamente');

    res.json({
      success: true,
      message: 'Clase finalizada y procesada con IA',
      sessionId: sessionId,
      contenidoGenerado: contenidoIA
    });

  } catch (error) {
    console.error('💥 Error finalizando clase:', error);
    res.status(500).json({
      error: 'Error procesando la clase con IA: ' + error.message
    });
  }
});

// 📍 ENDPOINT 5: LISTAR CLASES DE UN PROFESOR
router.get('/clases/:profesorId', async (req, res) => {
  try {
    const { profesorId } = req.params;
    console.log(`📚 Obteniendo clases del profesor: ${profesorId}`);

    const { data, error } = await supabase
      .from('video_classes')
      .select('*')
      .eq('teacher_id', profesorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Encontradas ${data.length} clases`);

    res.json({
      success: true,
      total: data.length,
      clases: data
    });

  } catch (error) {
    console.error('💥 Error obteniendo clases:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// 📍 ENDPOINT 6: OBTENER RESUMEN DE UNA CLASE
router.get('/resumen/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`📋 Obteniendo resumen de clase: ${sessionId}`);

    const { data, error } = await supabase
      .from('video_classes')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    if (!data.ai_content) {
      return res.status(404).json({
        error: 'Esta clase aún no ha sido procesada con IA'
      });
    }

    const contenidoIA = JSON.parse(data.ai_content);

    console.log('✅ Resumen encontrado');

    res.json({
      success: true,
      sesion: {
        id: data.id,
        estudiante: data.student_name,
        fecha: data.created_at,
        estado: data.status,
        temas: data.topics_covered,
        vocabulario: data.new_vocabulary,
        nivel: data.student_level
      },
      contenido: contenidoIA
    });

  } catch (error) {
    console.error('💥 Error obteniendo resumen:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
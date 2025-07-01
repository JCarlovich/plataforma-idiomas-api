const { GoogleGenerativeAI } = require('@google/generative-ai');

// Obtener la clave de las variables de entorno (SIN ERROR SI FALTA)
const apiKey = process.env.GOOGLE_AI_API_KEY;

// Configurar el modelo solo si hay clave
let genAI = null;
let model = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('✅ Google AI configurado correctamente');
  } catch (error) {
    console.error('⚠️ Error configurando Google AI:', error.message);
  }
} else {
  console.log('⚠️ Google AI no configurado - funcionará en modo degradado');
}

// Función principal que genera contenido educativo
const generarResumenClase = async (datosClase) => {
  
  // Verificar si tenemos IA disponible
  if (!apiKey || !model) {
    console.log('⚠️ Google AI no disponible, devolviendo contenido básico');
    return {
      resumen: "Clase completada exitosamente (modo sin IA)",
      vocabulario_repaso: ["palabra1", "palabra2", "palabra3"],
      ejercicios_practica: [
        {
          "tipo": "completar_frases",
          "instruccion": "Completa las siguientes frases",
          "ejercicio": "Practicar el vocabulario nuevo"
        }
      ],
      ejercicios_pronunciacion: [
        {
          "palabra": "ejemplo",
          "fonetica": "/ejemplo/",
          "consejo": "Practicar la pronunciación"
        }
      ],
      recomendaciones: [
        "Continuar practicando el vocabulario",
        "Revisar las notas de la clase"
      ],
      proxima_clase: "Revisar y ampliar el vocabulario de esta clase"
    };
  }

  // Crear el "prompt" - instrucciones para la IA
  const prompt = `
Eres un profesor de idiomas experto. Basándote en esta clase:

👤 Estudiante: ${datosClase.nombreEstudiante}
📊 Nivel: ${datosClase.nivelEstudiante || 'No especificado'}
📚 Temas tratados: ${datosClase.temasTratados}
🆕 Vocabulario nuevo: ${datosClase.vocabularioNuevo || 'No especificado'}
⚠️ Dificultades: ${datosClase.dificultadesObservadas || 'Ninguna mencionada'}
📝 Notas del profesor: ${datosClase.notasProfesor || 'Sin notas adicionales'}

Genera una respuesta en formato JSON con esta estructura exacta:

{
  "resumen": "Resumen de la clase en 2-3 líneas",
  "vocabulario_repaso": ["palabra1", "palabra2", "palabra3"],
  "ejercicios_practica": [
    {
      "tipo": "completar_frases",
      "instruccion": "Completa las siguientes frases con el vocabulario nuevo",
      "ejercicio": "La ___ está en la mesa (mesa/silla)"
    },
    {
      "tipo": "traduccion", 
      "instruccion": "Traduce las siguientes frases",
      "ejercicio": "How do you say 'table' in Spanish?"
    },
    {
      "tipo": "conversacion",
      "instruccion": "Practica esta conversación",
      "ejercicio": "- ¿Dónde está la mesa?\\n- La mesa está en la cocina"
    }
  ],
  "ejercicios_pronunciacion": [
    {
      "palabra": "mesa",
      "fonetica": "/ˈme.sa/",
      "consejo": "Pronuncia la 'e' como en 'perro'"
    }
  ],
  "recomendaciones": [
    "Recomendación específica 1",
    "Recomendación específica 2"
  ],
  "proxima_clase": "Sugerencia para la próxima clase"
}

Responde SOLO con el JSON válido, sin texto adicional.
  `;

  try {
    console.log('🤖 Enviando datos a la IA...');
    
    // Enviar prompt a la IA
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ IA respondió, procesando...');
    
    // Intentar convertir la respuesta en JSON
    try {
      const contenidoJSON = JSON.parse(text);
      console.log('🎉 Contenido generado exitosamente');
      return contenidoJSON;
      
    } catch (parseError) {
      console.error('⚠️ Error parseando respuesta de IA:', text);
      
      // Si falla, devolver estructura básica
      return {
        resumen: "Clase completada exitosamente",
        vocabulario_repaso: [],
        ejercicios_practica: [],
        ejercicios_pronunciacion: [],
        recomendaciones: ["Continuar practicando"],
        proxima_clase: "Revisar vocabulario de esta clase"
      };
    }
    
  } catch (error) {
    console.error('❌ Error comunicándose con la IA:', error);
    
    // Devolver contenido básico en caso de error
    return {
      resumen: "Clase completada exitosamente (error de IA)",
      vocabulario_repaso: [],
      ejercicios_practica: [],
      ejercicios_pronunciacion: [],
      recomendaciones: ["Continuar practicando"],
      proxima_clase: "Revisar vocabulario de esta clase"
    };
  }
};

// Exportar la función para usarla en otros archivos
module.exports = { generarResumenClase };
//este codigo me lo dio la IA para filtrar mas rapido 
// main.js
const XLSX = require('xlsx');

/**
 * Capitaliza un string (primera letra de cada palabra en mayúscula)
 * @param {string} str - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
function capitalizeString(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim();
}

/**
 * Separa una cadena de docentes por comas y devuelve un array con docentes individuales
 * @param {string} docentesStr - Cadena con uno o más docentes
 * @returns {Array} Array de docentes individuales
 */
function separarDocentes(docentesStr) {
    if (!docentesStr) return [];
    
    // Separar por comas y limpiar cada nombre
    return docentesStr
        .split(',')
        .map(docente => docente.trim())
        .filter(docente => docente.length > 0);
}

/**
 * Elimina duplicados exactos (mismo docente y mismas materias)
 * @param {Array} docentes - Array de objetos docente
 * @returns {Array} Array sin duplicados
 */
function eliminarDuplicadosExactos(docentes) {
    const unicos = new Map();
    
    docentes.forEach(docente => {
        // Crear una clave única basada en docente y materias ordenadas
        const materiasOrdenadas = [...docente.materias].sort().join('|');
        const clave = `${docente.docente}|${materiasOrdenadas}`;
        
        if (!unicos.has(clave)) {
            unicos.set(clave, docente);
        }
    });
    
    return Array.from(unicos.values());
}

/**
 * Procesa un archivo Excel y extrae los datos de docentes
 * @param {string} filePath - Ruta del archivo Excel
 * @returns {Array} Array de objetos con los datos procesados
 */
function procesarExcelDocentes(filePath) {
    try {
        // Leer el archivo Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const datos = XLSX.utils.sheet_to_json(worksheet);
        
        // Objeto para agrupar docentes y sus materias
        const docentesMap = new Map();
        
        // Contador para IDs
        let idCounter = 1;
        
        // Procesar cada fila del Excel
        datos.forEach((row, index) => {
            const actividad = capitalizeString(row['actividad'] || row['Actividad'] || '');
            const docenteStr = row['docentes'] || row['Docentes'] || row['docente'] || row['Docente'] || '';
            
            // Si no hay docente, saltar esta fila
            if (!docenteStr) return;
            
            // Separar docentes si hay varios en una celda
            const docentesIndividuales = separarDocentes(docenteStr);
            
            // Procesar cada docente individualmente
            docentesIndividuales.forEach(docenteNombre => {
                const docenteCapitalizado = capitalizeString(docenteNombre);
                
                // Si es la primera vez que vemos a este docente, inicializarlo
                if (!docentesMap.has(docenteCapitalizado)) {
                    docentesMap.set(docenteCapitalizado, {
                        id: idCounter++,
                        docente: docenteCapitalizado,
                        materias: [],
                        puntaje: 0,
                        cantReseñas: 0,
                        reseñas: []
                    });
                }
                
                // Agregar la materia si existe y no está ya en la lista
                if (actividad && !docentesMap.get(docenteCapitalizado).materias.includes(actividad)) {
                    docentesMap.get(docenteCapitalizado).materias.push(actividad);
                }
            });
        });
        
        // Convertir Map a Array
        let resultado = Array.from(docentesMap.values());
        
        // Eliminar duplicados exactos (por si acaso)
        resultado = eliminarDuplicadosExactos(resultado);
        
        // Reasignar IDs en orden
        resultado = resultado.map((docente, index) => ({
            ...docente,
            id: index + 1
        }));
        
        return resultado;
        
    } catch (error) {
        console.error('Error al procesar el archivo Excel:', error);
        return [];
    }
}

/**
 * Guarda los datos procesados en un archivo JSON
 * @param {Array} datos - Datos a guardar
 * @param {string} outputPath - Ruta del archivo de salida
 */
function guardarJSON(datos, outputPath) {
    try {
        const fs = require('fs');
        const jsonString = JSON.stringify(datos, null, 2);
        fs.writeFileSync(outputPath, jsonString, 'utf8');
        console.log(`✅ Datos guardados exitosamente en: ${outputPath}`);
        console.log(`📊 Total de docentes procesados: ${datos.length}`);
    } catch (error) {
        console.error('Error al guardar el archivo JSON:', error);
    }
}

/**
 * Función principal
 */
function main() {
    console.log('=== PROCESADOR DE EXCEL A JSON ===\n');
    
    // Configuración
    const archivoExcel = './materiasydocentes.xlsx';
    const archivoSalida = './docentes.json';
    
    console.log(`📂 Procesando archivo: ${archivoExcel}`);
    
    // Verificar si el archivo existe
    const fs = require('fs');
    if (!fs.existsSync(archivoExcel)) {
        console.error(`❌ Error: No se encuentra el archivo "${archivoExcel}"`);
        console.log('Por favor verifica que el archivo esté en la misma carpeta.');
        return;
    }
    
    // Procesar el Excel
    const datosProcesados = procesarExcelDocentes(archivoExcel);
    
    if (datosProcesados.length > 0) {
        // Guardar en JSON
        guardarJSON(datosProcesados, archivoSalida);
        
        // Mostrar resumen
        console.log('\n📋 RESUMEN DE DOCENTES PROCESADOS:');
        console.log('─'.repeat(60));
        
        // Ordenar alfabéticamente por nombre de docente
        datosProcesados.sort((a, b) => a.docente.localeCompare(b.docente));
        
        datosProcesados.forEach(docente => {
            console.log(`ID: ${docente.id.toString().padEnd(4)} | Docente: ${docente.docente.padEnd(40)} | Materias: ${docente.materias.length}`);
        });
        
        console.log('─'.repeat(60));
        
        // Mostrar estadísticas
        console.log('\n📈 ESTADÍSTICAS:');
        console.log(`• Total de docentes únicos: ${datosProcesados.length}`);
        
        const totalMaterias = datosProcesados.reduce((sum, docente) => sum + docente.materias.length, 0);
        const promedioMaterias = (totalMaterias / datosProcesados.length).toFixed(2);
        console.log(`• Total de materias asignadas: ${totalMaterias}`);
        console.log(`• Promedio de materias por docente: ${promedioMaterias}`);
        
        // Mostrar algunos ejemplos
        console.log('\n👨‍🏫 EJEMPLOS DE DOCENTES PROCESADOS:');
        const ejemplos = datosProcesados.slice(0, 3);
        ejemplos.forEach(docente => {
            console.log(`\nDocente: ${docente.docente}`);
            console.log(`Materias: ${docente.materias.join(', ')}`);
        });
        
    } else {
        console.log('⚠️ No se encontraron datos para procesar.');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

// Exportar funciones para uso externo
module.exports = {
    procesarExcelDocentes,
    guardarJSON,
    capitalizeString,
    separarDocentes,
    eliminarDuplicadosExactos
};
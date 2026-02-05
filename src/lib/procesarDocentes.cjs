// procesador-docentes.js
const XLSX = require('xlsx');
const fs = require('fs');

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
 * Elimina duplicados exactos (mismo nombre y mismas materias)
 * @param {Array} docentes - Array de objetos docente
 * @returns {Array} Array sin duplicados
 */
function eliminarDuplicadosExactos(docentes) {
    const unicos = new Map();
    
    docentes.forEach(docente => {
        // Crear una clave única basada en nombre y materias ordenadas
        const materiasOrdenadas = [...docente.materias].sort().join('|');
        const clave = `${docente.nombre}|${materiasOrdenadas}`;
        
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
                const nombreCapitalizado = capitalizeString(docenteNombre);
                
                // Si es la primera vez que vemos a este docente, inicializarlo
                if (!docentesMap.has(nombreCapitalizado)) {
                    docentesMap.set(nombreCapitalizado, {
                        nombre: nombreCapitalizado,
                        materias: []
                    });
                }
                
                // Agregar la materia si existe y no está ya en la lista
                if (actividad && !docentesMap.get(nombreCapitalizado).materias.includes(actividad)) {
                    docentesMap.get(nombreCapitalizado).materias.push(actividad);
                }
            });
        });
        
        // Convertir Map a Array
        let resultado = Array.from(docentesMap.values());
        
        // Eliminar duplicados exactos (por si acaso)
        resultado = eliminarDuplicadosExactos(resultado);
        
        // Ordenar alfabéticamente por nombre
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        
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
        const jsonString = JSON.stringify(datos, null, 2);
        fs.writeFileSync(outputPath, jsonString, 'utf8');
        console.log(`✅ Datos guardados exitosamente en: ${outputPath}`);
        console.log(`📊 Total de docentes procesados: ${datos.length}`);
    } catch (error) {
        console.error('Error al guardar el archivo JSON:', error);
    }
}

/**
 * Guarda los datos en formato JSON simple para POST al backend
 * @param {Array} datos - Datos a guardar
 * @param {string} outputPath - Ruta del archivo de salida
 */
function guardarJSONParaBackend(datos, outputPath) {
    try {
        // Formato específico para enviar al backend
        const docentesFormatoBackend = datos.map(docente => ({
            nombre: docente.nombre,
            especialidad: docente.materias.join(', ') // Unir materias en string
        }));
        
        const jsonString = JSON.stringify(docentesFormatoBackend, null, 2);
        fs.writeFileSync(outputPath, jsonString, 'utf8');
        console.log(`✅ JSON para backend guardado en: ${outputPath}`);
        console.log(`📊 Listo para enviar al endpoint POST`);
    } catch (error) {
        console.error('Error al guardar el JSON para backend:', error);
    }
}

/**
 * Guarda los datos en formato array puro para bulk insert
 * @param {Array} datos - Datos a guardar
 * @param {string} outputPath - Ruta del archivo de salida
 */
function guardarJSONBulkArray(datos, outputPath) {
    try {
        // Formato array puro para bulk insert
        const bulkArray = datos.map(docente => ({
            nombre: docente.nombre,
            materias: docente.materias // Mantener como array si el backend lo acepta
        }));
        
        const jsonString = JSON.stringify(bulkArray, null, 2);
        fs.writeFileSync(outputPath, jsonString, 'utf8');
        console.log(`✅ JSON array para bulk insert guardado en: ${outputPath}`);
    } catch (error) {
        console.error('Error al guardar el JSON bulk array:', error);
    }
}

/**
 * Función principal
 */
function main() {
    console.log('=== PROCESADOR DE EXCEL A JSON (Versión Simplificada) ===\n');
    
    // Configuración
    const archivoExcel = './materiasydocentes.xlsx';
    const archivoSalidaJSON = './docentes-simplificado.json';
    const archivoParaBackend = './docentes-para-backend.json';
    const archivoBulkArray = './docentes-bulk-array.json';
    
    console.log(`📂 Procesando archivo: ${archivoExcel}`);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(archivoExcel)) {
        console.error(`❌ Error: No se encuentra el archivo "${archivoExcel}"`);
        console.log('Por favor verifica que el archivo esté en la misma carpeta.');
        console.log('Puedes cambiar el nombre en la variable "archivoExcel" (línea 136)');
        return;
    }
    
    // Procesar el Excel
    const datosProcesados = procesarExcelDocentes(archivoExcel);
    
    if (datosProcesados.length > 0) {
        // 1. Guardar JSON simplificado (solo nombre y materias)
        guardarJSON(datosProcesados, archivoSalidaJSON);
        
        // 2. Guardar formato para enviar al backend
        guardarJSONParaBackend(datosProcesados, archivoParaBackend);
        
        // 3. Guardar como array para bulk insert
        guardarJSONBulkArray(datosProcesados, archivoBulkArray);
        
        // Mostrar resumen
        console.log('\n📋 RESUMEN DE DOCENTES PROCESADOS:');
        console.log('─'.repeat(70));
        
        datosProcesados.slice(0, 10).forEach((docente, index) => {
            console.log(`${(index + 1).toString().padEnd(3)} | Nombre: ${docente.nombre.padEnd(40)} | Materias: ${docente.materias.length}`);
            if (docente.materias.length > 0) {
                console.log(`     Materias: ${docente.materias.slice(0, 3).join(', ')}${docente.materias.length > 3 ? '...' : ''}`);
            }
        });
        
        if (datosProcesados.length > 10) {
            console.log(`     ... y ${datosProcesados.length - 10} docentes más`);
        }
        
        console.log('─'.repeat(70));
        
        // Mostrar estadísticas
        console.log('\n📈 ESTADÍSTICAS:');
        console.log(`• Total de docentes únicos: ${datosProcesados.length}`);
        
        const totalMaterias = datosProcesados.reduce((sum, docente) => sum + docente.materias.length, 0);
        const promedioMaterias = (totalMaterias / datosProcesados.length).toFixed(2);
        console.log(`• Total de materias asignadas: ${totalMaterias}`);
        console.log(`• Promedio de materias por docente: ${promedioMaterias}`);
        
        // Mostrar archivos generados
        console.log('\n📁 ARCHIVOS GENERADOS:');
        console.log(`1. ${archivoSalidaJSON} - JSON con estructura completa`);
        console.log(`2. ${archivoParaBackend} - JSON listo para enviar al backend (POST)`);
        console.log(`3. ${archivoBulkArray} - JSON como array para bulk insert`);
        
        console.log('\n📤 CÓMO USAR LOS ARCHIVOS:');
        console.log('Para enviar a tu backend:');
        console.log('1. Abre Postman');
        console.log('2. Método: POST');
        console.log('3. URL: http://tu-backend.com/api/docentes');
        console.log('4. Body → raw → JSON');
        console.log('5. Copia el contenido de docentes-para-backend.json');
        console.log('\nO para bulk insert:');
        console.log('1. Copia el contenido de docentes-bulk-array.json');
        console.log('2. Envía como array puro al endpoint bulk');
        
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
    guardarJSONParaBackend,
    guardarJSONBulkArray,
    capitalizeString,
    separarDocentes,
    eliminarDuplicadosExactos
};
# Prompt de Comportamiento para IA

Este documento define las reglas y expectativas para la IA asistente integrada en Antigravity, con foco en desarrollo frontend y pruebas.

## 1. Formato y estilo de codigo

- Usa tabulacion para formatear el codigo de forma consistente.
- Prioriza soluciones simples y legibles.
- Evita la duplicacion; reutiliza logica existente antes de crear nuevas funciones.
- Hay que tener en cuenta la refactorizacion del codigo para que sea mas mantenible y escalable, coherencia con la limpieza que hemos realizado previamente para no tener deuda tecnica.
- Siempre agregar comentarios para explicar el codigo que se ha creado, siempre los comentarios en inglés. En el inicio del archivo debe haber un breve resumen de lo que hace el archivo.
- Agregar comentarios explicativos a cada funcion y/o cada bloque de codigo.
- En el el caso de haber un export debe haber un comentario explicando a donde va destinado

## 2. Gestion de servidores y entornos

- Al realizar cambios, inicia siempre un servidor nuevo para las pruebas correspondientes.
- Elimina servidores de pruebas anteriores antes de iniciar uno nuevo.
- Escribe codigo que contemple los entornos de desarrollo, pruebas y produccion.

## 3. Validacion y pruebas

- Asegurate de que los cambios realizados sean los solicitados o que esten plenamente comprendidos.
- No introduzcas nuevas tecnologias o patrones al corregir errores sin agotar primero las opciones actuales.
- Si introduces una nueva tecnologia, elimina la implementacion anterior para evitar logica duplicada.
- No quiero que se borre la base de datos al crear tests. nunca uses deleteMany({}) si va a crear borrados innecesarios de la base de datos.
- **NUNCA WIPEAR LA BASE DE DATOS**: Bajo ninguna circunstancia se debe borrar la base de datos de desarrollo o produccion. Los tests deben correr en un entorno aislado.

## 4. Organizacion y mantenimiento

- Manten la base de codigo limpia y bien organizada.
- Evita escribir scripts directamente en entornos si solo se ejecutaran una vez.
- Documenta cada cambio relevante con comentarios claros y concisos.

## 5. Comportamiento de la IA

- Sugiere soluciones basadas en codigo existente antes de proponer nuevas implementaciones.
- Prioriza la seguridad, la estabilidad y la claridad del codigo.
- No realices acciones destructivas sin confirmacion explicita del usuario.
- Proporciona explicaciones breves y educativas al sugerir cambios o mejoras.

## 6. Registro y trazabilidad (obligatorio)

- Manten un registro vivo ai/context.md`. En cada respuesta que implique decisiones, cambios o proximos pasos, anade una entrada con:
  - Fecha (ISO) y hora
  - Acciones realizadas
  - Decisiones tomadas y pendientes
  - Proximos pasos
  - Archivos tocados (ruta:linea si aplica)
  - Notas o riesgos
- Si el entorno no permite escribir archivos, incluye el bloque de actualizacion ai/context.md` en la respuesta y solicita permiso para persistirlo.
- El objetivo es que otra IA o persona pueda continuar el trabajo con minima friccion.

## 7. Actualizar CHANGELOG

- Tras cada iteracion que cambia el comportamiento de la aplicacion deja constancia actualizando `ai/changelog.md`.
- Elimina del comportamiento las formas previas de funcionamiento de los elementos que se cambiaron para no causar confusion.

## 8. rESPETAR COHERENCIA DE TEMA E IDIOMAS

- En cada cambio que te solicite quiero que lo hagas teniendo en cuenta el modo blanco y negro para que tenga coherencia visual con el restop de componentes y de igualmodo si existen varios idiomans soportados por la aplicacion deberás hacerlo.

FROM cypress/base:18.16.0

# Crear carpeta app dentro del contenedor
WORKDIR /app

# Copiar el contenido de tu proyecto
COPY . .

# Instalar dependencias (incluyendo Cypress desde package.json)
RUN npm install

# Verificar que Cypress funcione (opcional)
RUN npx cypress verify

# Ejecutar Cypress tests (headless por defecto)
CMD ["npx", "cypress", "run"]


#Para construir la imagen de docker se usan estos comandos:
    #docker build -t test-cypress .
    #docker run --rm -it test-cypress

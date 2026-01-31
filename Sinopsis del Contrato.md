# Pool de Inversión Colectiva - Scaffold-ETH 2 🏗️

## I. Sinopsis del Contrato ...

Un sistema de inversión colectiva descentralizado construido con **Scaffold-ETH 2**, que permite a los miembros depositar fondos, crear propuestas de inversión y gestionar inversiones de manera colaborativa.

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/00-Pantalla_principal_PoolInversiones.png" style="zoom:50%;" />

### 1. Despliegue de la Dapp:

- Address: **0xE5dF3b138272801d7d031B244D7970bBdc90EB1c**

- Etherscan: **https://sepolia.etherscan.io/address/0xE5dF3b138272801d7d031B244D7970bBdc90EB1c**
- Implementación en Vercel: **https://inversion-pool-9q220iccn-miguels-projects-0512m3h.vercel.app/**
- Github: **https://github.com/miguelmejias0512/mi-proyecto-dapp**

### 2. Características

- **Depósitos y Retiros**: Los usuarios pueden depositar ETH para convertirse en miembros activos y retirar sus fondos en cualquier momento
- **Sistema de Propuestas**: Los miembros pueden crear propuestas de inversión que deben ser aprobadas por administradores
- **Panel de Administración**: Los administradores pueden aprobar, rechazar y ejecutar propuestas
- **Interfaz en Español**: Toda la interfaz está completamente en español
- **Gestión de Miembros**: Sistema de membresía basado en depósitos activos
- **Estadísticas en Tiempo Real**: Visualización del balance del pool, miembros activos y propuestas.

### 3. Arquitectura y Seguridad

El contrato hereda de dos piezas fundamentales de **OpenZeppelin**:

- **AccessControl:** Permite definir roles específicos (como `ADMIN_ROLE`) para restringir funciones críticas.
- **ReentrancyGuard:** Implementa el modificador `nonReentrant`, que protege al contrato contra ataques de reentrada durante las transferencias de fondos.

### 4. Gestión de Miembros y Depósitos

El sistema rastrea a cada participante mediante una estructura `Member`:

- **Depósito Mínimo:** Se requiere un mínimo de **0.01 ether** para participar.
- **Registro de Miembros:** Cuando un usuario deposita, el contrato lo marca como activo, guarda su balance, el timestamp y actualiza un contador global de depósitos.
- **Retiros:** Los miembros pueden retirar sus fondos en cualquier momento, siempre que tengan balance suficiente. Si el balance llega a cero, el estado del miembro pasa a ser inactivo.

### 5. Ciclo de Vida de las Propuestas

Cualquier miembro activo puede proponer una inversión. El proceso sigue un flujo lógico de estados:

1. **Creación:** Un miembro define una descripción, el destino de los fondos y el monto. El monto no puede exceder el balance total del pool.
2. **Revisión (Admin):** Los administradores pueden revisar la propuesta y decidir si la aprueban o la rechazan.
3. **Ejecución:** Una vez aprobada, un administrador puede ejecutarla. Esto transfiere los fondos del contrato a la dirección destino. Si la transferencia falla, el contrato revierte los cambios para proteger los fondos.

### 6. Funciones Administrativas

El rol de administrador tiene facultades especiales para mantener la salud del pool:

- **Ajustes:** Cambiar el depósito mínimo requerido.
- **Gestión de Roles:** El administrador por defecto (`DEFAULT_ADMIN_ROLE`) puede añadir o eliminar a otros administradores.
- **Personalización:** Cambiar un mensaje de saludo (`greeting`) para fines informativos o de interfaz.

> [!IMPORTANT]
>
> ### Detalles Técnicos Relevantes
>
> - **Manejo de Errores:** Utiliza `Custom Errors` (como `InsufficientBalance` o `NotMember`). Esto es mucho más eficiente en términos de gas que usar strings en `require`.
> - **Transparencia:** El contrato emite eventos para cada acción importante (`Deposited`, `Withdrawn`, `ProposalCreated`), lo que facilita el rastreo de actividades desde aplicaciones externas (frontend).
> - **Funciones de Lectura:** Incluye múltiples funciones para consultar el estado, como `getActiveProposals`, `getMemberInfo` y `getActiveMembers`, permitiendo una auditoría fácil del pool. 

------

## **II. Desarrollado con Scaffold-ETH 2** 🏗️ 

**Scaffold-ETH 2**  es un conjunto de herramientas de código abierto y actualizado para crear aplicaciones descentralizadas (dapps) en la blockchain de Ethereum. Está diseñado para facilitar a los desarrolladores la creación e implementación de contratos inteligentes y la creación de interfaces de usuario que interactúen con dichos contratos.

> [!NOTE]
>
> ⚙️ Desarrollado con NextJS, RainbowKit, Hardhat, Wagmi, Viem y Typescript.
>
> - ✅ **Recarga en caliente de contratos**: El frontend se adapta automáticamente al contrato inteligente a medida que se edita.
> - 🪝 **[Ganchos personalizados](https://docs.scaffoldeth.io/hooks/)**: Posee una colección de Hooks de React que envuelven [wagmi](https://wagmi.sh/) para simplificar las interacciones con contratos inteligentes con autocompletado de Typescript.
> - 🧱 [**Componentes**](https://docs.scaffoldeth.io/components/): Colección de componentes web3 comunes para crear rápidamente el frontend.
> - 🔥 **Billetera de reserva y faucet local**: Permite probar rápidamente la aplicación con una billetera de reserva y un faucet local.
> - 🔐 **Integración con proveedores de billeteras**: Permite conectar a diferentes proveedores de billeteras e interactuar con la red Ethereum.

### 1. Requerimientos previos

**(PASOS BÁSICOS PARA INCIAR Y PONER EN FUNCIONAMIENTO UN PROYECTO EN SCAFFOLD-ETH)**

#### **Paso 1.** Instalar o actualizar **NodeJs** 

En este caso a su versión **LTS** actual **v24.13.0**

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/01-nodejs.png"  />

#### **Paso 2.** Instalar o actualizar **npm**

 Ya que **NodeJS** actual viene con la version de **npm** **11.6.2** hay que actualizarlo a la versión **11.7.0** por requerimiento de **Scaffold-ETH 2**.

#### **Paso 3.** Instalar **GIT**

Tener instalado **GIT** previamente en el equipo de desarrollo.

#### **Paso 4.** Instalar **Yarn**

Para instalar **Yarn** hay que efectuar los siguientes comandos en la terminal:

 * Las versiones mas recientes de **NodeJs** ya vienen con **corepack** y con el es la manera más fácil para instalar **Yarn**

   ```bash
   $ corepack enable
   ```

 * Este comando instala y activa la versión más reciente de **Yarn** la cual es la **4.12.0**

   ```bash
   $ corepack prepare yarn@stable --activate
   ```

#### **Paso 5.** Iniciar la creación del proyecto **Scaffold-ETH** 2

Desde el portal oficial de **Scaffold-ETH 2** se puede obtener el siguiente comando: **npx create-eth@latest** para realizar la correcta creación de un proyecto nuevo. Se puede acceder al portal a través del siguiente URL:

```url
https://scaffoldeth.io/
```



<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/02-Saffold-ETH2.png" style="zoom:50%;" />

Una vez copiado el comando se ejecuta en la terminal.

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/02-Crea-Proy_Scaffold-ETH.png" style="zoom:67%;" />

- Una vez aquí se procede a asignarle un nombre al proyecto, por ejemplo: **mi-primer-dapp**

- Y luego elegir la opción **Hardhat** durante el proceso de creación del proyecto, aunque también se puede elegir **Foundry**

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/03-Opc-Hardhat.png" style="zoom:67%;" />

### 2. Inicio Rápido

#### **Paso 1.**  Ingresar al directorio del proyecto

Una vez finalizado el proceso de creación del nuevo proyecto podemos efectuar las siguientes opciones de trabajo.

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/04-Proy_Creado.png" style="zoom:67%;" />

- Para ingresar al directorio del proyecto recién creado, se efectúa por medio del siguiente comando.

  ```bash
  cd mi-proyecto-dapp
  ```

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/06-directorio-proy.png" style="zoom:67%;" />

#### **Paso 2.** Abrir por lo menos 4 terminales dentro del directorio.

Dentro del directorio del proyecto abrir por lo menos 4 terminales, las cuales estarán ubicadas dentro del directorio del proyecto al cual se accedió en el paso anterior.

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/05-Terminales.png" style="zoom:67%;" />

* En la primera terminal se inicia una cadena de Blockchain local, ejecutando el siguiente comando:

  ```bash
  $ yarn chain
  ```

* En la segunda terminal se que despliega el contrato inteligente, utilizando el siguiente comando:

  ```bash
  $ yarn deploy
  ```

* En la tercera terminal se inicia un servidor localhost donde se ejecutara la Dapp localmente en nuestro computador, a través del siguiente comando:

  ```bash
  $ yarn start
  ```

* En la cuarta terminal abrimos el Visual Studio Code y así poder interactuar el código del Stack, por medio del siguiente comando:

  ```bash
  $ code .
  ```

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/20-codigo.png" style="zoom:67%;" />

* Eventualmente tendremos que limpiar la memoria completamente y redesplegar el contrato haciendolo por medio del siguiente comando:

  ```bash
  $ yarn deploy --reset
  ```

* Para poder ejecutar la Dapp, se realiza a través de un navegador de internet en el cual ejecutamos el siguiente link que permite acceder a la aplicación, esto nos permite ir diseñando y visualizando las modificaciones que se le van realizando a la Dapp.

  ```url
  http://localhost:3000/
  ```

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/08-teminales.png" style="zoom:67%;" />

> [!TIP]
>
> En este punto sólo resta elaborar los contratos inteligentes que se deseen agregar a la Dapp y realizar las respectivas modificaciones y personalizaciones particulares de cada quien, o lo que es lo mismo, a partir de aquí es que comienza el desarrollo de la Dapp realmente.
>
> * Podrás interactuar con el contrato inteligente mediante la página `Depurardor Contratos`. Puedes ajustar la configuración de la aplicación en `packages/nextjs/scaffold.config.ts`. Visita tu aplicación en: `http://localhost:3000`. Puedes interactuar con tu contrato inteligente mediante la página `Debug Contracts`. Además de poder ajustar la configuración de la aplicación en `packages/nextjs/scaffold.config.ts`.
>
> * Podrás ejecutar pruebas al contrato por medio del siguiente comando:
>
>   ```bash
>   $ yarn hardhat:test
>   ```
>
> <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/10-test.png" style="zoom:67%;" />
>
> <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/11-test.png" style="zoom:67%;" />
>
> - Edita tus contratos inteligentes en `packages/hardhat/contracts`.
>- Edita la página de inicio de tu frontend en `packages/nextjs/app/page.tsx`. Para obtener orientación sobre el enrutamiento y la configuración de páginas y diseños, consulta la documentación de Next.js. - Edita tus scripts de implementación en `packages/hardhat/deploy`
> - Visita la documentación (https://docs.scaffoldeth.io) para aprender a empezar a desarrollar con Scaffold-ETH 2. Y para saber más sobre sus características, visita nuestro sitio web (https://scaffoldeth.io).

------

## III. Despliegue del Contrato

#### 	**Paso-01: Importar cuenta Administrador**

Ejecuta el siguiente comando en la terminal, para importar la clave privada del **address** que se quiere como administrador del contrato

```bash
# Ejecuta este comando, debes recordar estar dentro del directorio del proyecto
$ yarn account:import
```

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/21-yarn_import_cuenta.png" style="zoom:67%;" />

> [!CAUTION]
>
> En este paso se genera el archivo **.env** en el directorio raíz llamado **hardhat**, este archivo contiene datos sensibles como la clave privada de el address que va actuar como administrador del contrato, así bajo ningún concepto debe ser compartido.

> [!TIP]
>
> También se puede crear el archivo `.env` con cualquier editor de texto y ubicado en la raíz del proyecto siguiendo la misma estructura que se presenta a continuación y sustituye tus **API_KEYs** respectivas para durante la ejecución del proyecto pueda utilizar las respectivas autorizaciones obtenidas por estas variables de entorno.
>
> ```code
> # Infura API Key
> # Obtén una gratis en: https://infura.io/
> 
> INFURA_API_KEY=tu_infura_api_key_aqui
> # Clave privada de tu wallet (SIN el prefijo 0x)
> 
> # ⚠️ NUNCA compartas esta clave ni la subas a GitHub
> PRIVATE_KEY=tu_clave_privada_sin_0x
> 
> # Etherscan API Key (para verificar contratos)
> # Obtén una gratis en: https://etherscan.io/myapikey
> ETHERSCAN_API_KEY=tu_etherscan_api_key_aqui
> ```

#### 	**Paso-02: Despliega el contrato en la Red de Sepolia.**

Nuevamente en la terminal ejecuta el comando que se presenta para desplegar el contrato en la Red de pruebas Sepolia.

```bash
# Despliegue de proyecto en Red Sepolia
$ yarn deploy --network sepolia
```

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/22-yarn_deploy-sepolia.png" style="zoom:67%;" />

#### 	**Paso-03: Verificación del contrato en la Red de Sepolia.**

Nuevamente en la terminal ejecuta el comando que se presenta para verificar el contrato recién desplegado en la Red de pruebas Sepolia.

```bash
# Verificación del contrato recién desplegado
$ yarn verify --network sepolia
```

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/23-yarn_verifica-contrato.png" style="zoom:67%;" />

De igual forma en el navegador, por medio del siguiente URL se puede acceder a la pagina de Etherscan y observar que el contrato fue verificado exitosamente:

```url
https://sepolia.etherscan.io/address/0xE5dF3b138272801d7d031B244D7970bBdc90EB1c
```

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/24-contrato-verificado.png" style="zoom:50%;" />

#### 	**Paso-04: Implementación de la Dapp en Vercel.**

- Es posible que primero debas iniciar sesión en Vercel ejecutando:

  ```bash
  $ yarn vercel:login
  ```

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/26-Vercel.png" style="zoom:67%;" />

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/25-Cuenta_Vercel.png" style="zoom:50%;" />

- Si desea implementar directamente desde la terminal, ejecuta esto y siga los pasos para implementar en Vercel:

  ```bash
  $ yarn vercel
  ```

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/28-Vercel.png" style="zoom:67%;" />

- Una vez que inicies sesión (correo electrónico, GitHub, etc.), las opciones predeterminadas deberían funcionar. Te darán una URL pública.

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/29-Vercel.png" style="zoom:67%;" />

- Si desea volver a implementar en la misma URL de producción, puede ejecutar:

  ```bash
  $ yarn vercel --prod
  ```

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/32-Vercel.png" style="zoom:67%;" />

- Aplicación implementada correctamente.

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/31-Vercel.png" style="zoom:50%;" />

  

------

## IV. Uso

### 1. Para Usuarios Regulares:

- **Conectar Wallet**: Conecta tu wallet de MetaMask u otra compatible

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/12-conecta.png" style="zoom: 50%;" />

  ![](/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/13-conecta.png)

- **Depositar Fondos**: Ve a la pestaña "Depositar" y deposita ETH (mínimo 0.01 ETH)

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/14-deposito.png" style="zoom: 67%;" />

- **Crear Propuestas**: Como miembro activo, puedes crear propuestas de inversión

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/15-crear-propuesta.png" style="zoom: 67%;" />

- **Retirar Fondos**: Retira tus fondos en cualquier momento desde la pestaña "Retirar"

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/16-retiro-fondo.png" style="zoom: 67%;" />

### 2. Para Administradores:

- **Revisar Propuestas**: En la pestaña "Administración", revisa las propuestas pendientes

- **Aprobar/Rechazar**: Decide qué propuestas aprobar o rechazar

- **Ejecutar Propuestas**: Ejecuta las propuestas aprobadas para enviar los fondos

- **Configurar Pool**: Ajusta el depósito mínimo según sea necesario

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/17-admin.png" style="zoom:67%;" />

  <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/19-admin.png" style="zoom:67%;" />

### 3. Estructura del Proyecto

```t
scaffold-eth-2/
├── packages/
│   ├── hardhat/
│   │   ├── contracts/
│   │   │   └── InvestmentPool.sol                # Contrato principal del pool de inversión
│   │   ├── deploy/
│   │   │   └── 00_deploy_investment_pool.ts      # Script de despliegue del contrato
│   │   └── test/Sistema de Votación
│   │       └── InvestmentPool.test.ts            # Tests del contrato
│   └── nextjs/
│       ├── app/
│       │   └── page.tsx (Home.tsx)               # Página principal
│       └── components/
│           └── investment-pool/
│               ├── PoolStats.tsx                 # Componente de estadísticas del pool
│               ├── DepositSection.tsx            # Componente de sección de depósitos
│               ├── WithdrawSection.tsx           # Componente de sección de retiros
│               ├── ProposalSection.tsx           # Componente de sección de propuestas
│               └── AdminSection.tsx              # Componente de panel de administración
```

### 4. Seguridad

El contrato incluye:

- **Access Control**: Sistema de roles para administradores
- **ReentrancyGuard**: Protección contra ataques de reentrada
- **Validaciones**: Validaciones exhaustivas en todas las funciones
- **Errores Personalizados**: Mensajes de error claros y específicos

------

## V. Flujo de la propuesta de inversión

### 1. Creación de la Propuesta

Alice decide que el pool debería invertir en el Proyecto X. Ella llama a la función `createProposal`.

- **Validaciones:** El contrato verifica que Alice sea un miembro activo , que la dirección del Proyecto X sea válida y que el monto solicitado no supere el balance total actual del pool (`totalPoolBalance`).
- **Resultado:** Se crea la propuesta con el ID 0, una descripción, el monto y el estado inicial `Pending`. Se emite el evento `ProposalCreated`.

### 2. Fase de Revisión y Aprobación

Bob, como administrador, revisa la propuesta de Alice.

- **Acción:** Bob llama a la función `approveProposal(0)`.
- **Validaciones:** El sistema confirma que quien llama es un administrador , que la propuesta existe y que no ha sido ejecutada previamente.
- **Resultado:** El estado de la propuesta cambia de `Pending` a `Approved`. Se registra quién hizo el cambio y se emite el evento `ProposalStatusChanged`.

### 3. Ejecución de la Inversión

Una vez aprobada, la inversión puede hacerse efectiva. Bob llama a `executeProposal(0)`.

- **Proceso Interno:**
  1. El contrato verifica de nuevo que el estado sea `Approved` y que haya fondos suficientes en el pool.
  2. La propuesta se marca internamente como `Executed` para evitar duplicidad.
  3. Se resta el monto del `totalPoolBalance` global.
  4. Se realiza la transferencia de ETH al Proyecto X mediante una llamada de bajo nivel (`.call`).
- **Manejo de Errores:** Si la transferencia falla por cualquier motivo técnico del receptor, el contrato **revierte** automáticamente el estado de la propuesta a `Approved` y devuelve el dinero al balance del pool para no perder el rastro de los fondos.

### 4. Finalización

Si la transferencia es exitosa, se emite el evento `ProposalExecuted` con un indicador de éxito `true`. Ahora, los fondos están en manos del Proyecto X y el balance del pool se ha actualizado correctamente para todos los miembros.

------



------

## VI. Seguridad del contrato en caso de retiro de fondos durante una propuesta aprobada en curso

Este escenario es crucial, y su análisis es muy importante ya que revela cómo el contrato maneja la **liquidez** y protege la integridad del pool frente a retiros masivos (o "bank runs").

En el siguiente apartado se muestra un paso  a paso a paso de lo que sucede cuando la liquidez del pool se ve comprometida por retiros antes de ejecutar una inversión:

### 1. El Conflicto de Liquidez

Cuando un miembro retira fondos, el contrato ejecuta lo siguiente:

- Resta el monto del balance individual del usuario (`members[msg.sender].balance`).
- Resta el monto del balance global del pool (`totalPoolBalance`).
- Utiliza `nonReentrant` para evitar que el usuario intente retirar más de lo debido mediante llamadas recursivas.

El riesgo surge porque una propuesta puede haber sido creada y aprobada basándose en un `totalPoolBalance` que ya no existe si muchos usuarios retiran su dinero antes de la ejecución.

### 2. La Salvaguarda en la Ejecución

El contrato cuenta con una "doble verificación" de seguridad. Aunque la propuesta haya pasado todos los filtros de aprobación, la función `executeProposal` realiza una comprobación crítica justo antes de enviar el dinero:

```solidity
if (proposal.amount > totalPoolBalance) {
    revert InsufficientPoolFunds(proposal.amount, totalPoolBalance);
}
```

- **Si el balance es insuficiente:** El contrato revertirá la transacción con el error `InsufficientPoolFunds`. Esto significa que la inversión **no se realizará** para proteger la solvencia del contrato.
- **Prioridad del Retiro:** En este diseño, el derecho del usuario a retirar su capital tiene "prioridad" técnica sobre la ejecución de la propuesta, ya que el retiro reduce el balance global inmediatamente.

### 3. El Rol de la Reentrada (ReentrancyGuard)

Tanto `withdraw` como `executeProposal` utilizan el modificador `nonReentrant`. Esto asegura que:

1. Un usuario no pueda iniciar un retiro y, antes de que termine, intentar ejecutar una propuesta para "vaciar" el contrato dos veces.
2. Las actualizaciones de balance ocurren antes o durante el proceso de transferencia, minimizando vectores de ataque comunes en DeFi.

### Resumen de Seguridad en este Caso:

| **Situación**                                                | **Resultado**                                   | **Mecanismo de Seguridad**                       |
| ------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| El usuario retira y deja el pool con menos fondos de los que pide la propuesta. | La propuesta **falla** al intentar ejecutarse.  | Error `InsufficientPoolFunds`.                   |
| El usuario intenta retirar mientras la propuesta se está transfiriendo. | El segundo proceso se bloquea.                  | Modificador `nonReentrant`.                      |
| La transferencia de la propuesta al destino falla.           | Los fondos se "devuelven" virtualmente al pool. | Bloque de reversión manual en `executeProposal`. |

------

## VII. Quién actúa como administrador del Pool  

En el contrato inteligente `InvestmentPool.sol`, la identidad del usuario administrador se define de la siguiente manera:

1. **El Administrador Inicial (Deployer):** Al momento de desplegar el contrato, la dirección (wallet) que realiza la transacción se convierte automáticamente en el administrador principal. Esto se define en el `constructor`, donde se le otorgan dos roles:

   - `**DEFAULT_ADMIN_ROLE**`: Es el rol de "super-administrador" que tiene el poder de gestionar a otros administradores.
   - `ADMIN_ROLE`: Es el rol necesario para aprobar, rechazar y ejecutar propuestas, así como para cambiar parámetros del contrato.

2. **Administradores Adicionales:** El contrato permite que existan múltiples administradores. Cualquier dirección que posea el `DEFAULT_ADMIN_ROLE` puede nombrar a nuevos administradores utilizando la función `addAdmin(address newAdmin)`.

   <img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/18-admin.png" style="zoom:67%;" />

> [!TIP]
>
> No hay una persona específica con nombre y apellido identificada en el código, sino que el administrador es **cualquier dirección de billetera a la que se le haya asignado el `ADMIN_ROLE`**. Inicialmente, es quien desplegó el contrato. Puedes verificar si una dirección específica es administrador utilizando la función de lectura `isAdmin(address account)`.

------

## VIII. Interactuando con el contrato **InvestmentPool** utilizando  MetaMask, un explorador de bloques (como Etherscan) o su interfaz web

### 1. Convertirse en Miembro (Depósito)

Para participar en el pool, primero debes enviar fondos.

- **Función a usar:** `deposit()`.
- **Monto mínimo:** Debes enviar al menos **0.01 ether**.
- **Qué sucede:** Al confirmar la transacción, el contrato te marcará como miembro activo (`isActive = true`) , registrará tu balance y aumentará el contador global del pool.
- **Nota técnica:** No intentes enviar fondos directamente a la dirección del contrato sin llamar a la función; aunque el contrato tiene un `receive()`, lo ideal es usar `deposit()` para asegurar que tu balance de miembro se actualice correctamente.

### 2. Crear una Propuesta de Inversión

Si eres miembro activo, puedes proponer en qué gastar los fondos del pool.

- **Función a usar:** `createProposal(description, target, amount)`.
- **Parámetros:**
  - `description`: Un texto breve (ej: "Inversión en Proyecto DeFi X").
  - `target`: La dirección de la billetera o contrato que recibirá los fondos.
  - `amount`: La cantidad en **wei** (1 ether = 10^18 wei).
- **Restricción:** El monto no puede superar el balance total actual del pool (`totalPoolBalance`).

### 3. Seguimiento de Propuestas

Puedes consultar el estado de cualquier inversión propuesta para saber si fue aceptada.

- **Función de consulta:** `getProposal(proposalId)`.
- **Estados posibles:** | Estado | ID Técnico | Significado | | :--- | :--- | :--- | | **Pending** | 0 | Recién creada, esperando revisión del administrador. | | **Approved** | 1 | El administrador dio luz verde para la inversión. | | **Rejected** | 2 | La propuesta fue descartada por la administración. | | **Executed** | 3 | Los fondos ya fueron enviados al destino.



------

## IX. Documentación técnica detallada del contrato inteligente **InvestmentPool**

<img src="/home/miguel/01-PROYECTO-HARDHAT/03-SCAFFOLDETH2/mi-proyecto-dapp/assets/20-codigo.png" style="zoom:50%;" />

### 1. Versión de Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
```

Es la línea de apertura clásica en casi cualquier contrato inteligente de Ethereum. No es "código" que ejecute una acción lógica (como una suma o una transferencia), simplemente **pragma** es una **instrucción técnica** para el compilador indicándole el lenguaje y versión con el cual está escrito el archivo y como debe procesar dicho código.

### 2. Arquitectura y Seguridad

El contrato utiliza herencia de **OpenZeppelin** para implementar estándares de seguridad probados:

```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

- **`AccessControl`**: Permite la gestión de permisos mediante roles específicos (`ADMIN_ROLE` y `DEFAULT_ADMIN_ROLE`).
- **`ReentrancyGuard`**: Protege las funciones que manejan transferencias de fondos contra ataques de reentrada.
- **`console.sol`**: Incluido para facilitar el rastreo y debugging durante el desarrollo.
- PoolInvestmentToken.sol: 

### 3. **Kit de emergencia** para desarrolladores

A continuación se presenta el equivalente al famoso `console.log()` de JavaScript o al `print()` de Python, pero adaptado al mundo de la Blockchain.

```solidity
// Útil para debugging en desarrollo local
import "hardhat/console.sol";
```

#### 	a. El problema que resuelve

Por naturaleza, los Smart Contracts son como "cajas negras". Cuando se ejecuta una función y algo sale mal, Ethereum simplemente dice: ***"Error: Transaction reverted"***. Y no indica qué pasó por dentro, ni cuánto valía una variable en ese momento.

#### 	b. `import "hardhat/console.sol";`

Esta instrucción trae una herramienta creada por **Hardhat** (el entorno de desarrollo más popular para Ethereum). Al importarla, se habilita una función mágica dentro de Solidity que permite imprimir datos en la terminal mientras pruebas el código.

#### 	c. ¿Cómo se usa en el código?

Una vez que se importa esa línea, se pueden hacer cosas como esta dentro de las funciones:

```solidity
function invertir() public payable {
    console.log("El usuario", msg.sender, "esta enviando:", msg.value);
    // Tu lógica aquí...
}
```

Al momento de correr las pruebas, se verá ese mensaje aparecer en la terminal, lo que permite rastrear errores sin desesperarse.

------

> [!CAUTION]
>
> Esta es una herramienta **exclusivamente para desarrollo**.
>
> - **No debe llegar a la red principal (Mainnet):** El código de `console.log` ocupa espacio y consume Gas innecesario.
> - **Antes de desplegar el contrato real:** Se debe borrar estas líneas o comentar los `console.log`. De hecho, la mayoría de los desarrolladores usan herramientas que eliminan estos mensajes automáticamente antes de enviar el contrato a producción.

#### 	d. Resumen de la utilidad

| **Herramienta** | **Uso Principal**                              | **¿Se usa en producción?** |
| --------------- | ---------------------------------------------- | -------------------------- |
| `console.log`   | Ver valores de variables en tiempo real.       | **No** (Solo local)        |
| `require()`     | Validar condiciones y dar mensajes de error.   | **Sí**                     |
| `events`        | Guardar registro de acciones en la blockchain. | **Sí**                     |

Es una pieza fundamental para que no tener que "adivinar" por qué falla el contrato de inversión.

### 4.  **Identidad** y las **defensas** del contrato

```solidity
contract InvestmentPool is AccessControl, ReentrancyGuard
```

En Solidity, la palabra clave `is` se usa para la **herencia**. Básicamente, se le está diciendo al compilador: *"el contrato `InvestmentPool` no empieza de cero; quiero que herede todas las funciones y reglas de `AccessControl` y `ReentrancyGuard`"*. Es como armar un mueble de LEGO usando piezas que ya vienen construidas y probadas.

A continuación se muestra el desglose de cada pieza:

#### 	a. `contract InvestmentPool`

Es el nombre de tu contrato. A partir de aquí, todo lo que escribas dentro de las llaves `{ ... }` es la lógica del pool de inversión.

#### 	b. `AccessControl` (El Portero)

Esta es una librería (usualmente de [OpenZeppelin](https://openzeppelin.com/)) que gestiona **quién puede hacer qué**.

- **Para qué sirve:** En lugar de tener solo un "Owner" (dueño), te permite crear roles específicos. Por ejemplo: un rol de `ADMIN`, un rol de `OPERATOR` y un rol de `WITHDRAWER`.
- **Por qué es mejor:** Si pierdes la llave del "Owner", el contrato queda huérfano. Con `AccessControl`, puedes tener varios administradores o niveles de permisos más granulares.

#### 	c. `ReentrancyGuard` (El Escudo Anti-Robo)

Este es, probablemente, el componente de seguridad más importante en **DeFi**.

- **El Problema:** Existe un ataque llamado "Reentrancy" (Reentrada) donde un hacker retira fondos y, antes de que el contrato actualice su saldo, el hacker vuelve a llamar a la función de retiro una y otra vez hasta vaciar el pool.
- **La Solución:** Este módulo te da un "modificador" llamado `nonReentrant`. Si lo usas en tus funciones, el contrato bloquea cualquier segundo intento de entrar a la función hasta que la primera ejecución haya terminado por completo. Es como una puerta giratoria que solo permite pasar a una persona a la vez.

------

#### 	d. Resumen Visual de la Herencia

| **Componente**      | **Función Principal**               | **Analogía**                                                 |
| ------------------- | ----------------------------------- | ------------------------------------------------------------ |
| **AccessControl**   | Gestión de permisos y roles.        | El carné de identidad que dice si puedes entrar a la zona VIP. |
| **ReentrancyGuard** | Prevención de ataques de reentrada. | Una cerradura que se bloquea por dentro mientras estás usando la habitación. |
| **InvestmentPool**  | Tu lógica de negocio.               | El edificio que utiliza esa seguridad y esos permisos.       |

> [!TIP]
>
> #### ¿Qué significa esto para el código?
>
> Que ahora, dentro de tu contrato, podrás escribir cosas como:
>
> - `function retirar() public nonReentrant { ... }` (Protegido contra hackers).
> - `function configurarPool() public onlyRole(ADMIN_ROLE) { ... }` (Solo para jefes).

### 5. Llave Maestra o Etiqueta de Identificación

```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
```

Define una **"llave maestra"** o etiqueta de identificación dentro del contrato. Se usa junto con el `AccessControl` antes mencionado.

A continuación se muestra una explicación sencilla de cada componente:

#### 	a. `bytes32`

Es el tipo de dato. En lugar de guardar el nombre del rol como un texto largo (String), Solidity prefiere usar una cadena de 32 bytes de datos "crudos".

- **¿Por qué?** Porque comparar y almacenar `bytes32` es mucho más **barato en Gas** (comisiones de red) que usar texto normal.

#### 	b. `public constant`

- **public**: Permite que cualquiera (u otros contratos) pueda ver cuál es el valor de esa variable.
- **constant**: Significa que este valor **no puede cambiar** una vez desplegado el contrato. Esto ahorra aún más Gas y da seguridad a los usuarios, ya que saben que las reglas de administración no cambiarán de repente.

#### 	c. `ADMIN_ROLE`

Es simplemente el nombre que tú le das a la variable. Por convención, en Solidity los roles se escriben en mayúsculas y con guiones bajos.

#### 	d. `keccak256("ADMIN_ROLE")`

Aquí es donde ocurre la magia técnica. `keccak256` es una **función hash** (criptográfica).

- Toma la palabra `"ADMIN_ROLE"` y la convierte en un identificador único de 32 bytes (algo que se ve así: `0xa4987...`).
- **¿Por qué no usar el texto directo?** Porque el hash garantiza que, sin importar lo largo que sea el nombre del rol, siempre ocupará exactamente 32 bytes, facilitando el trabajo interno de la Máquina Virtual de Ethereum (EVM).

------

> [!TIP]
>
> #### ¿Para qué sirve esto en la práctica?
>
> Imagina que quieres que solo el administrador pueda pausar el pool de inversión. Gracias a que definiste esta línea, luego podrás escribir:
>
> ```solidity
> function pausarTodo() public onlyRole(ADMIN_ROLE) {
>  // Solo alguien que tenga asignado el hash de ADMIN_ROLE podrá ejecutar esto
> }
> ```
>
> Es como crear el **molde de una llave**. En esta línea defines cómo es la llave, y más adelante (en el `constructor`) decidirás a qué billeteras de personas reales les entregas una copia de esa llave.

### 6. Estructuras de Datos y Estados

El contrato organiza la información clave mediante las siguientes estructuras y enums:

```solidity
    // ============ Estructuras ============
    
    struct Member {
        uint256 balance;           // Balance del miembro en el pool
        uint256 depositedAt;       // Timestamp del último depósito
        bool isActive;             // Estado del miembro
        uint256 depositCounter;    // Contador de depósitos del miembro
    }
    
    struct Proposal {
        uint256 id;                // ID de la propuesta
        string description;        // Descripción de la inversión
        address target;            // Dirección destino de los fondos
        uint256 amount;            // Cantidad a invertir
        address proposer;          // Quien creó la propuesta
        uint256 createdAt;         // Timestamp de creación
        bool executed;             // Si ya fue ejecutada
        ProposalStatus status;     // Estado actual
    }
    
    enum ProposalStatus {
        Pending,    // Pendiente de revisión
        Approved,   // Aprobada para ejecución
        Rejected,   // Rechazada
        Executed    // Ejecutada
    }
```

#### 	Estructuras (`struct`)

- **`Member`**: Almacena el balance del usuario, el timestamp del último depósito, su estado de actividad y el número de depósitos realizados.
- **`Proposal`**: Contiene toda la información de una inversión: ID, descripción, dirección destino (`target`), cantidad, proponente, fecha de creación, estado de ejecución y estatus actual.

#### 	Estados de Propuesta (`enum ProposalStatus`)

Define el ciclo de vida de una inversión: `Pending` (Pendiente), `Approved` (Aprobada), `Rejected` (Rechazada) y `Executed` (Ejecutada).

### 7. Variables de Estado

Estas líneas definen qué datos se guardan permanentemente en la blockchain y cómo se organiza la información del pool de inversión.

```solidity
    // ============ Variables de Estado ============
    
    mapping(address => Member) public members;
    address[] public memberAddresses;
    
    Proposal[] public proposals;
    
    uint256 public totalPoolBalance;
    uint256 public minimumDeposit = 0.01 ether;
    uint256 public proposalCount;
      
    // Variables adicionales del contrato
    string public greeting = "Building Unstoppable Investment Pools!!!";
    uint256 public totalDepositCounter = 0;
    mapping(address => uint256) public userDepositCounter;
```

#### 	a. Los Mappings (Diccionarios de datos)

Los `mapping` son como bases de datos de "llave-valor".

- `mapping(address => Member) public members;`: Asocia la dirección de una billetera (`address`) con una estructura llamada `Member` (que seguramente contiene nombre, saldo, etc.). Es como buscar a un socio por su número de identificación.
- `mapping(address => uint256) public userDepositCounter;`: Registra cuántas veces ha depositado cada usuario específicamente.

#### 	b. Los Arrays (Listas)

- `address[] public memberAddresses;`: Una lista que guarda las direcciones de todos los que han entrado. Esto es necesario porque en los `mapping` no puedes "iterar" (no puedes preguntar: "¿quiénes son todos los socios?"), así que usamos esta lista para llevar el registro.
- `Proposal[] public proposals;`: Una lista de objetos tipo `Proposal`. Aquí es donde se guardarán las ideas de inversión que los socios votarán.

#### 	c. Variables de Estado (Variables Globales)

Son los "números maestros" del contrato:

- `totalPoolBalance`: El dinero total que hay en el pool en este momento.
- `minimumDeposit = 0.01 ether;`: La barrera de entrada. Si alguien intenta mandar menos de 0.01 ETH, el contrato podrá rechazarlo.
- `proposalCount`: Un contador simple para saber cuántas propuestas se han creado sin tener que contar toda la lista cada vez.

#### 	d. Variables de Personalización

- `greeting`: Un mensaje de texto (`string`) que sirve de bienvenida. Al ser `public`, cualquier interfaz (DApp) puede leerlo para mostrarlo en pantalla.
- `totalDepositCounter`: Un contador global de cuántas transacciones de depósito se han hecho en total desde que nació el contrato.

> [!NOTE]
>
> #### ¿Cómo se ve esto en conjunto?
>
> Imagina que el contrato es un **Club de Inversión físico**:
>
> 1. El `mapping` es el **expediente** de cada socio.
> 2. El `memberAddresses` es la **lista de nombres** en la puerta.
> 3. El `proposals` es el **libro de actas** donde se anotan las ideas.
> 4. El `totalPoolBalance` es el **dinero que hay en la caja fuerte**.

> [!TIP]
>
> **Sobre `0.01 ether`**: Solidity entiende la palabra `ether` y la convierte automáticamente a **Wei** (la unidad más pequeña), por lo que `0.01 ether` es igual a $10^{16}$ Wei.

### 8. Eventos

Los **eventos** son la "bitácora" o el historial del contrato. En el mundo de la blockchain, leer lo que pasa dentro de un contrato desde afuera (por ejemplo, desde una página web o una App) es difícil y costoso si no usas eventos.

Cuando una función emite un evento, esa información se guarda en los **Logs** de la transacción. Es mucho más barato que guardar datos en variables de estado y permite que aplicaciones externas (como Etherscan o tu propia web) "escuchen" en tiempo real lo que sucede.

```solidity
    // ============ Eventos ============
    
    event Deposited(
        address indexed member,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );
    
    event Withdrawn(
        address indexed member,
        uint256 amount,
        uint256 remainingBalance,
        uint256 timestamp
    );
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        address target,
        uint256 amount,
        uint256 timestamp
    );
    
    event ProposalStatusChanged(
        uint256 indexed proposalId,
        ProposalStatus oldStatus,
        ProposalStatus newStatus,
        address changedBy,
        uint256 timestamp
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address target,
        uint256 amount,
        bool success,
        uint256 timestamp
    );
    
    event MinimumDepositChanged(
        uint256 oldMinimum,
        uint256 newMinimum,
        uint256 timestamp
    );
    
    event AdminAdded(
        address indexed admin,
        address indexed addedBy,
        uint256 timestamp
    );
    
    event AdminRemoved(
        address indexed admin,
        address indexed removedBy,
        uint256 timestamp
    );
    
    event GreetingChange(
        address indexed greetingSetter, 
        string newGreeting, 
        uint256 timestamp
    );
```

A continuación se presenta un desglose de los puntos clave de estos eventos en el contrato:

#### 	a. La palabra clave `indexed`

Se observa que algunos parámetros dicen `indexed` (como `address indexed member`).

- **Para qué sirve:** Permite que las herramientas externas **filtren** los resultados.
- **Ejemplo:** Si se quiere buscar todos los depósitos que ha hecho *específicamente* una billetera, solo se pueden hacer si la dirección fue marcada como `indexed`. Si no lo está, habrá que descargar todos los eventos de la historia y buscarlos uno por uno (lo cual es lento y pesado).

#### 	b. Categorías de los eventos de contrato

| **Tipo de Evento**                                           | **Qué rastrea**                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Financieros** (`Deposited`, `Withdrawn`)                   | El flujo de dinero. Guardan el `timestamp` (fecha/hora) para saber cuándo entró o salió el capital. |
| **Gobernanza** (`ProposalCreated`, `ProposalStatusChanged`, `ProposalExecuted`) | El ciclo de vida de una inversión. Permite ver desde que nace una idea hasta que se ejecuta el pago al "target" (destino). |
| **Administración** (`AdminAdded`, `AdminRemoved`, `MinimumDepositChanged`) | Cambios en las reglas del juego. Son vitales para la transparencia; los usuarios pueden auditar si el administrador cambió el depósito mínimo sin avisar. |
| **Social** (`GreetingChange`)                                | Un registro simple de quién cambió el mensaje de bienvenida. |

------

#### 	c. ¿Cómo funcionan en la práctica?

Imagina que un usuario hace un depósito. En el código se tiene  algo como esto:

```solidity
emit Deposited(msg.sender, msg.value, currentBalance, block.timestamp);
```

Al hacer ese `emit`:

1. El contrato realiza la lógica (sumar saldo).
2. Se genera un "recibo" digital permanente.
3. El sitio web detecta el evento y muestra un mensaje: *"¡Depósito exitoso! Has enviado 1 ETH"*.

> [!NOTE]
>
> ### ¿Por qué incluyes `uint256 timestamp`?
>
> Aunque la blockchain ya sabe en qué bloque ocurrió la transacción, incluir el `timestamp` directamente en el evento facilita mucho la vida a los desarrolladores de Frontend para mostrar fechas legibles (ej. "Hace 5 minutos") sin tener que hacer consultas extra a la red.

### 9. Errores personalizados

Esta sección del código utiliza **Errores Personalizados (Custom Errors)**, una de las mejores prácticas introducidas en Solidity 0.8.4.

Antes, los desarrolladores usaban cadenas de texto largas como `require(condicion, "Este es un mensaje de error muy largo que consume mucho gas")`. Los errores personalizados son mucho más modernos, eficientes y elegantes.

```solidity
    // ============ Errores Personalizados ============
    
    error InsufficientDeposit(uint256 sent, uint256 minimum);
    error InsufficientBalance(uint256 requested, uint256 available);
    error InsufficientPoolFunds(uint256 requested, uint256 available);
    error ProposalAlreadyExecuted(uint256 proposalId);
    error ProposalNotApproved(uint256 proposalId);
    error InvalidProposalId(uint256 proposalId);
    error InvalidAmount(uint256 amount);
    error InvalidAddress(address addr);
    error TransferFailed(address to, uint256 amount);
    error NotMember(address addr);
```

> [!TIP]
>
> ### ¿Por qué usarlos en lugar de `require` con texto?
>
> 1. **Ahorro de Gas:** El texto ("strings") ocupa mucho espacio en la blockchain. Los errores personalizados se guardan como un código numérico corto (un selector de 4 bytes), lo que hace que fallar una transacción sea mucho más barato.
> 2. **Información Dinámica:** Permiten pasar variables. Por ejemplo, en lugar de decir "Saldo insuficiente", puedes decir exactamente cuánto falta (ver el error `InsufficientDeposit`).

#### 	a. Diccionario de errores del Pool

| **Error**                   | **Significado Técnico**                                      |
| --------------------------- | ------------------------------------------------------------ |
| **InsufficientDeposit**     | El usuario intentó entrar al pool con menos de 0.01 ETH. Devuelve cuánto envió y cuánto era el mínimo. |
| **InsufficientBalance**     | Un miembro intenta retirar más dinero del que él personalmente ha depositado. |
| **InsufficientPoolFunds**   | El contrato no tiene suficiente dinero total para pagar una inversión aprobada. |
| **ProposalAlreadyExecuted** | Alguien intentó ejecutar una propuesta que ya se pagó (evita el doble gasto). |
| **ProposalNotApproved**     | Se intentó ejecutar una propuesta que no ha pasado por votación o fue rechazada. |
| **InvalidProposalId**       | El número de propuesta que buscas no existe en la lista.     |
| **InvalidAmount**           | Se envió un valor de cero o negativo donde se esperaba un número positivo. |
| **InvalidAddress**          | Se intentó usar la dirección `0x000...` o una dirección no válida. |
| **TransferFailed**          | Un error crítico: el contrato intentó enviar Ether pero la red o la billetera receptora lo rechazó. |
| **NotMember**               | Alguien que no ha depositado fondos intentó realizar una acción exclusiva para socios (como votar). |

#### 	b. ¿Cómo se ven en el código real?

Cuando se escriban las funciones, en lugar de un `if` gigante, utilizará algo como esto:

```solidity
if (msg.value < minimumDeposit) {
    revert InsufficientDeposit(msg.value, minimumDeposit);
}
```

Esto hace que si alguien se equivoca, su billetera (como MetaMask) reciba un error específico que puede ser interpretado fácilmente por la página web para mostrarle un mensaje amigable al usuario.

### 10. Modificadores

Son una de las herramientas más potentes de Solidity. Funcionan como "filtros" o "guardias de seguridad" que se ejecutan **antes** de que el código de una función principal empiece a correr.

Su objetivo es evitar la repetición de código (principio DRY: *Don't Repeat Yourself*). Si 10 funciones diferentes requieren que seas miembro, no escribes la validación 10 veces; usas un modificador.

```solidity
    // ============ Modificadores ============
    
    modifier onlyMember() {
        if (!members[msg.sender].isActive) {
            revert NotMember(msg.sender);
        }
        _;
    }
    
    modifier validProposal(uint256 proposalId) {
        if (proposalId >= proposals.length) {
            revert InvalidProposalId(proposalId);
        }
        _;
    }
```

#### 	a. `modifier onlyMember()`

Este es el "derecho de admisión".

- **La lógica:** Revisa en el `mapping` de `members` si la dirección de quien llama a la función (`msg.sender`) tiene el booleano `isActive` en `true`.
- **El error:** Si no es miembro, lanza el error personalizado `NotMember` que definimos en el paso anterior.
- **El símbolo `_;` (Underscore):** Es la parte más importante. Le dice a Solidity: *"Si la condición anterior se cumple, ahora ejecuta el resto del código de la función"*.

#### 	b. `modifier validProposal(uint256 proposalId)`

Este filtro asegura que no intentes interactuar con algo que no existe.

- **La lógica:** Compara el número de propuesta que el usuario envió con el largo total de la lista `proposals`.
- **Ejemplo:** Si hay 5 propuestas (índices 0 al 4) y se intenta votar por la propuesta número 10, el contrato detectará que `10 >= 5` y detendrá la ejecución inmediatamente.
- **Prevención de errores:** Evita que el contrato colapse o gaste gas intentando buscar datos en una posición de memoria vacía.

------

> [!TIP]
>
> ### ¿Cómo se aplican en el contrato?
>
> Cuando se escriben funciones de inversión, se verá más o menos así:
>
> ```solidity
> function votar(uint256 _id) public onlyMember validProposal(_id) {
>  // Este código solo se ejecuta si:
>  // 1. Eres miembro activo.
>  // 2. El ID de la propuesta existe.
>  proposals[_id].votes += 1;
> }
> ```

> [!NOTE]
>
> ### Ventajas de este enfoque:
>
> 1. **Legibilidad:** Al leer el encabezado de la función, ya sabes cuáles son los requisitos.
> 2. **Seguridad:** Centralizas las reglas. Si mañana decides que para ser miembro necesitas algo más, solo cambias el código en el `modifier` y se actualiza en todas las funciones automáticamente.

### 11. Constructor

Es la función especial que se ejecuta **una sola vez**, justo en el momento en que el contrato se despliega en la blockchain. Sirve para configurar el estado inicial y asignar los primeros privilegios.

```solidity
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
```

#### 	a. `_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);`

Esta es una regla de seguridad de OpenZeppelin.

- **Qué hace:** Asigna el rol de "Súper Administrador" a la persona que está desplegando el contrato (`msg.sender`).
- **Por qué es importante:** El `DEFAULT_ADMIN_ROLE` es el único que tiene el poder de dar o quitar otros roles. Es la raíz de la jerarquía de permisos.

#### 	b. `_grantRole(ADMIN_ROLE, msg.sender);`

Aquí le das a esa misma persona el rol de administrador específico que definiste anteriormente con el hash `keccak256`.

- Mientras que el primero es para gestionar permisos, este segundo suele usarse para la **lógica de negocio** (como cambiar el depósito mínimo o aprobar propuestas).

#### 	c. Las líneas de `console.log`

Como vimos antes, estas líneas imprimirán mensajes en tu terminal de desarrollo (Hardhat):

- Te confirmarán visualmente quién es el dueño del contrato.
- Te mostrarán el mensaje de bienvenida (`greeting`) para asegurar que las variables de estado se inicializaron correctamente.

------

> [!IMPORTANT]
>
> ### Un detalle técnico: `msg.sender`
>
> En el contexto del constructor, `msg.sender` siempre es la dirección de la billetera que paga el gas para crear el contrato. Si usas un script de despliegue, asegúrate de que esa billetera sea la que quieres que tenga el control total inicial.

> [!CAUTION]
>
> En un entorno de producción real, una buena práctica es transferir estos roles a una **Multi-sig** (una billetera que requiere varias firmas, como Gnosis Safe) poco después del despliegue para evitar que el contrato dependa de una sola persona.

### 12. Funciones Principales (Lógica de Negocio)

#### 	Gestión de Fondos

- **`deposit()`**: Permite a los usuarios enviar ETH. Requiere un mínimo de 0.01 ether. Si el usuario es nuevo, se agrega a la lista de miembros y se activan sus contadores.
- **`withdraw(uint256 amount)`**: Permite a un miembro retirar una cantidad específica. Verifica que tenga balance suficiente y actualiza el estado global antes de transferir. Si el balance llega a 0, el miembro se marca como inactivo.

#### 	Ciclo de Propuestas

- **`createProposal(...)`**: Solo miembros activos pueden proponer inversiones. Valida que el monto no exceda el balance total del pool.
- **`approveProposal(uint256 proposalId)`**: Función exclusiva para administradores que cambia el estado a `Approved`.
- **`rejectProposal(uint256 proposalId)`**: Permite a un administrador rechazar una propuesta pendiente.
- **`executeProposal(uint256 proposalId)`**: Ejecuta la transferencia de fondos a la dirección destino. Incluye una lógica de reversión manual: si la transferencia falla, restaura el balance y el estado de la propuesta para evitar pérdida de fondos.

### 13. Funciones de Consulta (Lectura)

Estas funciones permiten la auditoría externa sin costo de gas (llamadas `view` o `pure`):

- **`getPoolBalance()`**: Devuelve el total de fondos gestionados.
- **`getMemberInfo(address member)`**: Retorna todos los datos de un miembro específico.
- **`getActiveProposals()`**: Filtra y devuelve solo las propuestas que están pendientes o aprobadas.
- **`getActiveMembers()`**: Genera una lista de las direcciones de todos los miembros con balance activo.

### 14. Administración y Utilidades

- **`setMinimumDeposit(uint256 newMinimum)`**: Ajusta la barrera de entrada al pool.
- **`addAdmin(address newAdmin)` / `removeAdmin(address admin)`**: Funciones críticas de gobernanza que solo el administrador principal puede ejecutar.
- **`setGreeting(string memory _newGreeting)`**: Permite actualizar el mensaje de bienvenida del contrato.
- **`receive()`**: Función especial que permite al contrato recibir ETH directamente, sumándolo al balance total del pool.
- **`fallback()`**: Función de seguridad que rechaza transacciones con datos incorrectos, solicitando el uso de `deposit()`.


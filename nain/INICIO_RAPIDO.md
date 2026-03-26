# 🚀 Inicio Rápido

## Para ejecutar la aplicación:

### 1️⃣ Instalar dependencias (solo la primera vez):
```bash
npm install
```

### 2️⃣ Iniciar el servidor:
```bash
npm start
```

### 3️⃣ Abrir en tu navegador:
```
http://localhost:3000
```

## 📱 Compartir con invitados:

Si quieres que otros accedan desde sus dispositivos:

### Opción A: Red local (misma WiFi)

1. Encuentra tu IP local:
   ```bash
   # En Mac/Linux:
   ifconfig | grep "inet "
   
   # En Windows:
   ipconfig
   ```

2. Comparte la URL con tu IP local:
   ```
   http://TU_IP_LOCAL:3000
   ```
   Ejemplo: `http://192.168.1.100:3000`

### Opción B: Exponer públicamente (con ngrok)

1. Instala ngrok: https://ngrok.com/download
   
2. Ejecuta:
   ```bash
   ngrok http 3000
   ```

3. Comparte la URL que te da ngrok (ej: `https://abc123.ngrok.io`)

## 🔧 Comandos útiles:

### Ver quién eligió cada regalo:
```bash
cat gifts.json
```

### Hacer backup de los regalos actuales:
```bash
cp gifts.json gifts.backup.json
```

### Restaurar desde backup:
```bash
cp gifts.backup.json gifts.json
```

### Resetear todos los regalos a "Disponible":
Edita `gifts.json` y cambia todos los `"status": "Ya elegido"` a `"status": "Disponible"` y `"claimedBy": {}` a `"claimedBy": null`

---

**¿Problemas?** Lee el `README.md` completo para más detalles.


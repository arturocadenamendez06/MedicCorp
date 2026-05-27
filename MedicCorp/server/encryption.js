// encryption
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// La clave debe tener exactamente 32 bytes para AES-256
const SECRET_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const IV_LENGTH = 16; // Para AES, el IV es de 16 bytes

class EncryptionService {
    
    // Encriptar texto
    static encrypt(text) {
        if (!text || text === '') return null;
        
        try {
            // Convertir a string si es número
            const textToString = String(text);
            
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), iv);
            
            let encrypted = cipher.update(textToString, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            return `${iv.toString('hex')}:${encrypted}`;
            
        } catch (error) {
            console.error('Error encriptando:', error);
            return null;
        }
    }
    
    // Desencriptar texto
    static decrypt(encryptedText) {
        if (!encryptedText || encryptedText === '') return null;
        
        try {
            const [ivHex, encryptedData] = encryptedText.split(':');
            
            if (!ivHex || !encryptedData) {
                throw new Error('Formato de datos encriptados inválido');
            }
            
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), iv);
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
            
        } catch (error) {
            console.error('Error desencriptando:', error);
            return null;
        }
    }
    
    // Encriptar objeto completo (para datos médicos)
    static encryptMedicalRecord(record) {
        const encrypted = { ...record };
        
        // TODOS los campos médicos se encriptarán
        const sensitiveFields = [
            'temperatura',      // Agregado
            'peso',            // Agregado
            'altura',          // Agregado
            'presion_arterial', // Agregado
            'diagnostico',
            'prescripcion',
            'resultados_analisis'
        ];
        
        for (const field of sensitiveFields) {
            if (encrypted[field] !== undefined && encrypted[field] !== null && encrypted[field] !== '') {
                encrypted[field] = this.encrypt(encrypted[field]);
            }
        }
        
        return encrypted;
    }
    
    // Desencriptar objeto completo
    static decryptMedicalRecord(record) {
        const decrypted = { ...record };
        
        const sensitiveFields = [
            'temperatura',
            'peso',
            'altura',
            'presion_arterial',
            'diagnostico',
            'prescripcion',
            'resultados_analisis'
        ];
        
        for (const field of sensitiveFields) {
            if (decrypted[field] !== undefined && decrypted[field] !== null && decrypted[field] !== '') {
                decrypted[field] = this.decrypt(decrypted[field]);
            }
        }
        
        return decrypted;
    }
    
    // Encriptar un campo individual (para uso específico)
    static encryptField(fieldName, value) {
        const sensitiveFields = [
            'temperatura', 'peso', 'altura', 'presion_arterial',
            'diagnostico', 'prescripcion', 'resultados_analisis'
        ];
        
        if (sensitiveFields.includes(fieldName) && value !== undefined && value !== null && value !== '') {
            return this.encrypt(value);
        }
        return value;
    }
    
    // Generar una nueva clave secreta
    static generateKey() {
        const key = crypto.randomBytes(32).toString('hex');
        console.log('Tu nueva clave secreta (guárdala en .env como ENCRYPTION_KEY):');
        console.log(key);
        return key;
    }
}

if (require.main === module) {
    EncryptionService.generateKey();
}

module.exports = EncryptionService;
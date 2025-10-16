import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = await mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'educafet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión
db.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos exitosa');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Error al conectar con la base de datos:', error);
  });
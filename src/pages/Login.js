import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Check if user email ends with @admin
      if (!user.email.endsWith('@admin.com')) {
        await auth.signOut();
        message.error('Acceso denegado: Solo administradores pueden acceder');
        return;
      }

      // Check if user exists in admins collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        await auth.signOut();
        message.error('Acceso denegado: Usuario no es administrador');
        return;
      }

      message.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error) {
      message.error('Error de autenticación: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Form
        name="login"
        onFinish={onFinish}
        style={{ 
          width: 300,
          padding: 24,
          borderRadius: 8,
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>CarMatch Admin</h1>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Por favor ingresa tu email' },
            { type: 'email', message: 'Email inválido' },
            { pattern: /@admin\.com$/, message: 'Debe ser un email de administrador' }
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Iniciar Sesión
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
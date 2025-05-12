import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        key: doc.id,
        ...doc.data(),
        authId: doc.data().userId || 'No disponible' // Usar userId del documento
      }));
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (userId, authId) => {
    Modal.confirm({
      title: '¿Estás seguro que quieres eliminar este usuario?',
      content: 'Esta acción eliminará al usuario de la base de datos y de la autenticación. No se puede deshacer.',
      okText: 'Sí',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Eliminar de la colección users
          await deleteDoc(doc(db, 'users', userId));

          // Eliminar de Authentication usando Cloud Function
          if (authId && authId !== 'No disponible') {
            const deleteUserAuth = httpsCallable(functions, 'deleteUser');
            try {
              await deleteUserAuth({ uid: authId });
              message.success('Usuario eliminado completamente');
            } catch (authError) {
              console.error("Error al eliminar usuario de Authentication:", authError);
              message.warning('Usuario eliminado de la base de datos, pero no se pudo eliminar de Authentication');
            }
          }

          fetchUsers(); // Actualizar la lista
        } catch (error) {
          console.error("Error al eliminar usuario:", error);
          message.error('Error al eliminar usuario');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom?.localeCompare(b.nom || '')
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Localització',
      dataIndex: 'location',
      key: 'location',
      filters: [...new Set(users.map(user => user.location).filter(Boolean))].map(location => ({
        text: location,
        value: location
      })),
      onFilter: (value, record) => record.location === value
    },
    {
      title: 'Vehicle',
      dataIndex: 'carInfo',
      key: 'carInfo',
      render: (carInfo) => carInfo ? `${carInfo[0]} - ${carInfo[1]}` : 'No especificat'
    },
    {
      title: 'ID d\'Autenticació',
      dataIndex: 'authId',
      key: 'authId',
      width: '300px',
      ellipsis: true
    },
    {
      title: 'Accions',
      key: 'action',
      width: '120px',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" danger onClick={() => handleDelete(record.key, record.authId)}>
            Eliminar
          </Button>
        </Space>
      ),
    }
  ];

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <Table 
        columns={columns} 
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    </div>
  );
}

export default Users;
import { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, message } from 'antd';
import { collection, getDocs, doc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      console.log('Buscant usuari amb ID:', userId);
      // Primer intentem buscar per userId
      let userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        // Si no trobem l'usuari, intentem buscar a la col·lecció amb una consulta
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          userDoc = querySnapshot.docs[0];
        }
      }

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userName = userData.nom || userData.name || userData.displayName || userData.email;
        console.log('Nom trobat:', userName);
        return userName || userId;
      }
      
      console.log('No s\'ha trobat l\'usuari');
      return userId;
    } catch (error) {
      console.error(`Error obtenint usuari ${userId}:`, error);
      return userId;
    }
  };

  const fetchTrips = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'trips'));
      const tripsPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        console.log('Dades del viatge:', data);
        const driverName = await fetchUserDetails(data.driverId);
        console.log('Nom del conductor trobat:', driverName);
        
        return {
          key: doc.id,
          ...data,
          driverName
        };
      });
      
      const tripsData = await Promise.all(tripsPromises);
      console.log('Dades finals dels viatges:', tripsData);
      setTrips(tripsData);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtenir viatges:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este viaje?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteDoc(doc(db, 'trips', tripId));
          message.success('Viaje eliminado correctamente');
          fetchTrips();
        } catch (error) {
          console.error("Error al eliminar el viaje:", error);
          message.error('Error al eliminar el viaje');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Origen',
      dataIndex: 'from',
      key: 'from',
    },
    {
      title: 'Destino',
      dataIndex: 'to',
      key: 'to',
    },
    {
      title: 'Conductor',
      dataIndex: 'driverName',
      key: 'driverName',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'pending' ? 'gold' :
          status === 'active' ? 'green' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" danger onClick={() => handleDelete(record.key)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Gestión de Viajes</h2>
      <Table 
        columns={columns} 
        dataSource={trips}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default Trips;
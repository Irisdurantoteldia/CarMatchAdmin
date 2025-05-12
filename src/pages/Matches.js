import { useState, useEffect } from 'react';
import { Table, Space, Button, Modal, message } from 'antd';
import { collection, getDocs, doc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      let userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          userDoc = querySnapshot.docs[0];
        }
      }

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.nom || userData.name || userData.displayName || userData.email || userId;
      }
      
      return userId;
    } catch (error) {
      console.error(`Error obtenint usuari ${userId}:`, error);
      return userId;
    }
  };

  const fetchMatches = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'matches'));
      const matchesPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userNames = await Promise.all(
          (data.users || []).map(userId => fetchUserDetails(userId))
        );
        
        return {
          key: doc.id,
          ...data,
          userNames
        };
      });
      
      const matchesData = await Promise.all(matchesPromises);
      setMatches(matchesData);
      setLoading(false);
    } catch (error) {
      console.error("Error obtenint matches:", error);
      message.error(`Error carregant matches: ${error.message}`);
      setLoading(false);
    }
  };

  const handleDelete = async (matchId) => {
    Modal.confirm({
      title: 'Estàs segur que vols eliminar aquest match?',
      content: 'Aquesta acció no es pot desfer',
      okText: 'Sí',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteDoc(doc(db, 'matches', matchId));
          message.success('Match eliminat correctament');
          fetchMatches();
        } catch (error) {
          console.error("Error eliminant match:", error);
          message.error('Error eliminant match');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Usuari 1',
      dataIndex: ['userNames', 0],
      key: 'user1',
      render: (text) => text || 'No disponible'
    },
    {
      title: 'Usuari 2',
      dataIndex: ['userNames', 1],
      key: 'user2',
      render: (text) => text || 'No disponible'
    },
    {
      title: 'Data del Match',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: 'Accions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => {
              Modal.info({
                title: 'Detalls del Match',
                content: (
                  <div>
                    <p>ID del Match: {record.key}</p>
                    <p>Usuari 1: {record.userNames[0]} (ID: {record.users[0]})</p>
                    <p>Usuari 2: {record.userNames[1]} (ID: {record.users[1]})</p>
                    <p>Data: {new Date(record.timestamp).toLocaleString()}</p>
                  </div>
                ),
              });
            }}
          >
            Veure Detalls
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record.key)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Gestió de Matches</h2>
      <Table 
        columns={columns} 
        dataSource={matches}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    </div>
  );
}

export default Matches;
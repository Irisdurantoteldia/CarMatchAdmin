import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, CarOutlined, TeamOutlined } from '@ant-design/icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    activeTrips: 0,
    matches: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Obtenir total d'usuaris
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Obtenir viatges actius (status 'pending' o 'active')
      const tripsSnapshot = await getDocs(collection(db, 'trips'));
      const activeTrips = tripsSnapshot.docs.filter(doc => 
        doc.data().status === 'pending' || doc.data().status === 'active'
      ).length;

      // Obtenir total de matches
      const matchesSnapshot = await getDocs(collection(db, 'matches'));
      const totalMatches = matchesSnapshot.size;

      setStats({
        users: totalUsers,
        activeTrips: activeTrips,
        matches: totalMatches
      });
    } catch (error) {
      console.error('Error al obtenir estadístiques:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Panell de Control</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Usuaris Totals"
              value={stats.users}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Viatges Actius"
              value={stats.activeTrips}
              prefix={<CarOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable>
            <Statistic
              title="Matches Totals"
              value={stats.matches}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, theme } from 'antd';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import SideMenu from './components/SideMenu';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Trips from './pages/Trips';
import Matches from './pages/Matches';
import Login from './pages/Login';

const { Header, Content, Sider } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <Layout style={{ minHeight: '100vh' }}>
          <Sider 
            collapsible 
            collapsed={collapsed} 
            onCollapse={(value) => setCollapsed(value)}
            style={{
              background: '#001529'
            }}
          >
            <div style={{ 
              height: '64px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: collapsed ? '14px' : '18px'
            }}>
              {collapsed ? 'CM' : 'CarMatch'}
            </div>
            <SideMenu />
          </Sider>
          <Layout>
            <Content style={{ margin: '24px 16px', marginTop:'10vh' }}>
              <div style={{ 
                padding: 24, 
                background: colorBgContainer, 
                borderRadius: borderRadiusLG,
                minHeight: 280 
              }}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      )}
    </Router>
  );
}

export default App;

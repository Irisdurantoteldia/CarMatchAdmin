import { Menu } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  CarOutlined, 
  TeamOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';

function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error al tancar sessió:", error);
    }
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Usuaris'
    },
    {
      key: '/trips',
      icon: <CarOutlined />,
      label: 'Viatges'
    },
    {
      key: '/matches',
      icon: <TeamOutlined />,
      label: 'Matches'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Tancar Sessió',
      danger: true,
      onClick: handleLogout
    }
  ];

  const handleMenuClick = ({ key }) => {
    if (key !== 'logout') {
      navigate(key);
    }
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );
}

export default SideMenu;
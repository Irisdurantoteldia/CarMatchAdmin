import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';

// Configure antd render for React 19 compatibility
unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});
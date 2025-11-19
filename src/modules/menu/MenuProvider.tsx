// === 📁 src/modules/menu/MenuProvider.tsx ===
// Context provider for menu state

import { MenuContext, useMenuState } from './useMenu';
import { ReactNode } from 'react';

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider = ({ children }: MenuProviderProps) => {
  const menuState = useMenuState();

  return (
    <MenuContext.Provider value={menuState}>
      {children}
    </MenuContext.Provider>
  );
};

export default MenuProvider;


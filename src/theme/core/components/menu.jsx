import { menuItem } from '../../styles';

const MuiMenuItem = {
  styleOverrides: { root: ({ theme }) => ({ ...menuItem(theme) }) },
};

export const menu = { MuiMenuItem };

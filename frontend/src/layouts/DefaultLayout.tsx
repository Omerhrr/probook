import React, { ReactNode } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface DefaultLayoutProps {
  children: ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth(); // Use auth context

  // Handle logout and redirect to login, for example
  // const router = useRouter(); // if using next/navigation for programmatic redirect
  const handleLogout = () => {
    logout();
    // router.push('/(pages)/login'); // Or rely on protected routes to redirect
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            ProBook
          </Typography>

          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} href="/(pages)/products">
                Products
              </Button>
              <Button color="inherit" component={Link} href="/(pages)/suppliers">
                Suppliers
              </Button>
              <Button color="inherit" component={Link} href="/(pages)/customers">
                Customers
              </Button>
              <Button color="inherit" component={Link} href="/(pages)/sales">
                Sales
              </Button>
              <Button color="inherit" component={Link} href="/(pages)/expenses">
                Expenses
              </Button>
              <Button color="inherit" component={Link} href="/(pages)/reports">
                Reports
              </Button>
              <Typography sx={{ ml: 2, mr: 1 }}>Hi, {user?.username}</Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <Button color="inherit" component={Link} href="/(pages)/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}{' '}
            ProBook Inc.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default DefaultLayout;

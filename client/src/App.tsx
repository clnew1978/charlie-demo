import { useState } from "react";
import "./App.css";
import ApolloAppProvider from './ApolloProvider';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';

import Reservations from './Reservations';
import Login from './Login';
import { AuthenticationContext, AuthenticationInfo } from './AuthenticationContext';


function App() {
  const [context, setContext] = useState<AuthenticationInfo>({ token: '', name: '', userType: '' });
  return (
    <AuthenticationContext.Provider value={context}>
      <ApolloAppProvider>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Charlie Demo
              </Typography>
              <Login setContext={setContext} />
            </Toolbar>
          </AppBar>
          <Reservations />
        </Box>
      </ApolloAppProvider>
    </AuthenticationContext.Provider>
  );
}

export default App;

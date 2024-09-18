import { ReactNode, useState, useEffect, useContext } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import { AuthenticationContext } from './AuthenticationContext';


const ApolloAppProvider = ({ children }: { children: ReactNode }) => {
  const authenticationContext = useContext(AuthenticationContext);
  const [client, setClient] = useState(new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_API_ENDPOINT,
    cache: new InMemoryCache(),
    headers: { Authorization: authenticationContext.token },
  }));
  useEffect(() => {
    setClient(
      new ApolloClient({
        uri: process.env.REACT_APP_GRAPHQL_API_ENDPOINT,
        cache: new InMemoryCache(),
        headers: { Authorization: authenticationContext.token },
      })
    );
  }, [authenticationContext]);
  return (<div key={authenticationContext.token}><ApolloProvider client={client}>{children}</ApolloProvider></div>);
};

export default ApolloAppProvider;
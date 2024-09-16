import { ReactNode } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';


const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_API_ENDPOINT,
  cache: new InMemoryCache(),
  headers: { Authorization: 'A9B563EE-2A59-47DC-8970-93E8458BCFE3+EBE64507-5680-46F1-A901-E6C97E634ED9' },
});
const ApolloAppProvider = ({ children }: { children: ReactNode }) => {
  return (<ApolloProvider client={client}>{children}</ApolloProvider>);
};
export default ApolloAppProvider;
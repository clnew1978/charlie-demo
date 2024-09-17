import { gql, useMutation, useQuery } from '@apollo/client';
import { Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { Button, TextField, CircularProgress, Autocomplete } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails, AccordionActions } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { AuthenticationContext, AuthenticationInfo } from './AuthenticationContext';

const loginClient = new ApolloClient({
    uri: process.env.REACT_APP_LOGIN_GRAPHQL_API_ENDPOINT,
    cache: new InMemoryCache(),
});

const LoginApolloAppProvider = ({ children }: { children: ReactNode }) => {
    return (<ApolloProvider client={loginClient}>{children}</ApolloProvider>);
};

const LOGIN_MUTATION = gql`
    mutation login($name: String!, $password: String!){
        login(name: $name, password: $password) {
            token
            name
            userType
        }
    }
`;

const GET_USERS = gql`
    query {
        users{
            id
            name
            phone
            userType
            password
        }
    }
`

function LoginPage({ setContext }: { setContext: Dispatch<SetStateAction<AuthenticationInfo>> }) {
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState('');
    const [login, { loading: mLoading, error: mError, data: mData, reset: mReset }] = useMutation(LOGIN_MUTATION); // result
    const { data: qData } = useQuery(GET_USERS);

    if (mLoading) {
        return (<CircularProgress />);
    }
    if (mError) {
        alert('Login failed');
        mReset();
        setPassword('');
    }
    if (mData) {
        setContext(mData.login);
    }
    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                try {
                    await login({ variables: { name, password } });
                } catch {
                }
            }}
        >
            <Accordion sx={{ width: '16em' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Please Login
                </AccordionSummary>
                <AccordionDetails>
                    <Autocomplete
                        noOptionsText={false}
                        onChange={(_event, newValue, reason) => {
                            if (reason === 'selectOption') {
                                setName(newValue.name);
                                setPassword(newValue.password);
                            }
                        }}
                        getOptionLabel={(option: any) => option.name}
                        options={qData ? qData.users : []}
                        renderInput={(params) => <TextField sx={{ px: 1, py: 1 }} required {...params} label="Username" />}
                    />
                    <TextField label="Password" sx={{ px: 1, py: 1 }} type="password" variant='outlined' value={password} onChange={e => setPassword(e.target.value)} />
                </AccordionDetails>
                <AccordionActions>
                    <Button color="inherit" type="submit">Login</Button>
                </AccordionActions>
            </Accordion>
        </form>
    );
}

function LogoutPage({ setContext }: { setContext: Dispatch<SetStateAction<AuthenticationInfo>> }) {
    const handleClick = async () => {
        setContext({ token: '', name: '', userType: '' });
    };
    return (<Button color="inherit" onClick={handleClick}>Logout</Button>)

}

function Login({ setContext }: { setContext: Dispatch<SetStateAction<AuthenticationInfo>> }) {
    const context = useContext(AuthenticationContext);
    if (context.token === '') {
        return (
            <LoginApolloAppProvider>
                <LoginPage setContext={setContext} />
            </LoginApolloAppProvider>
        );
    } else {
        return (<LogoutPage setContext={setContext} />);
    }
}

export default Login;

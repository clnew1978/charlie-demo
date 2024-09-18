import { gql, useMutation, useQuery } from '@apollo/client';
import { Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { Button, TextField, CircularProgress, Autocomplete } from '@mui/material';
import { DialogTitle, Dialog, DialogContent, DialogActions, DialogContentText } from '@mui/material';

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

function LoginDialog({ setContext, open, onClose }: {
    setContext: Dispatch<SetStateAction<AuthenticationInfo>>,
    open: boolean,
    onClose: () => void
}) {
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState('');
    const [login, { loading: mLoading, error: mError, data: mData, reset: mReset }] = useMutation(LOGIN_MUTATION);
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
    const submit = async () => {
        try {
            await login({ variables: { name, password } });
            onClose();
        } catch {
        }
    };
    return (
        <Dialog open={open} onClose={onClose} >
            <DialogTitle>Login</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ fontSize: 12 }}>
                    Five inbuilt users<br></br>
                    Same password(12345)<br></br>
                    Just Select one
                </DialogContentText>
                <Autocomplete
                    freeSolo
                    onChange={(_event, newValue, reason) => {
                        if (reason === 'selectOption') {
                            setName(newValue.name);
                            setPassword(newValue.password);
                        }
                    }}
                    onInputChange={(_event, newValue) => {
                        setName(newValue);
                    }}
                    getOptionLabel={(option: any) => option.name}
                    options={qData ? qData.users : []}
                    renderInput={(params) => (<TextField label="Username" sx={{ px: 1, py: 1, width: '16em' }} required {...params} />)}
                />
                <TextField label="Password" sx={{ px: 1, py: 1, width: '16em' }} type="password" variant='outlined' value={password} onChange={e => setPassword(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={submit}>Ok</Button>
                <Button onClick={onClose} autoFocus>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

}

function LoginPage({ setContext }: { setContext: Dispatch<SetStateAction<AuthenticationInfo>> }) {
    const [open, setOpen] = useState(false);

    const handleClick = async () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    }
    return (
        <div>
            <Button color="inherit" onClick={handleClick}>Login</Button>
            <LoginDialog setContext={setContext} open={open} onClose={onClose} />
        </div>
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

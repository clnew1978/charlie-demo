import { useContext, useState, useReducer } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { CircularProgress, Alert, Stack, Button, TextField, Box } from '@mui/material';
import {
    TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DateTimePicker, LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { AuthenticationContext } from './AuthenticationContext';
import ReservationsReducer from './ReservationsReducer';


const GET_RESERVATIONS = gql`
    query reservations($begin: Date, $end: Date, $status: ReservationStatus) {
        reservations(begin: $begin, end: $end, status: $status){
            id
            guestName
            guestPhone
            arrivalTime
            tableSize
            status
        }
    }
`;

const ADD_RESERVATIONS = gql`
    mutation addReservation($guestName: String!,$guestPhone: String!,$arrivalTime: Date!,$tableSize: Int!) {
        addReservation(input:{guestName:$guestName,guestPhone:$guestPhone,arrivalTime:$arrivalTime,tableSize:$tableSize}){
            id
            guestName
            guestPhone
            arrivalTime
            tableSize
            status
        }
    }
`;

const UPDATE_RESERVATIONS = gql`
    mutation updateReservation($id: String!,$guestName:String!,$guestPhone:String!,$arrivalTime:Date!,$tableSize:Int!,$status:ReservationStatus!) {
        updateReservation(input:{id:$id,guestName:$guestName,guestPhone:$guestPhone,arrivalTime:$arrivalTime,tableSize:$tableSize,status:$status}){
            id
            guestName
            guestPhone
            arrivalTime
            tableSize
            status
        }
    }
`;


interface Reservation {
    id: string;
    guestName: string;
    guestPhone: string;
    arrivalTime: Date;
    tableSize: number;
    status: string;
};

function EditingReservationRow({ reservation, setIsEditing, dispatch }: { reservation: Reservation, setIsEditing: any, dispatch: any }) {
    const [updateReservation, { loading, error, reset }] = useMutation(UPDATE_RESERVATIONS);
    const context = useContext(AuthenticationContext);
    const [guestName, setGuestName] = useState(reservation.guestName);
    const [guestPhone, setGuestPhone] = useState(reservation.guestPhone);
    const [tableSize, setTableSize] = useState(reservation.tableSize);
    const [status, setStatus] = useState(reservation.status);
    const [arrivalTime, setArrivalTime] = useState(new Date(reservation.arrivalTime));

    if (loading) {
        return (<CircularProgress />);
    }
    if (error) {
        alert('Edit Reservation Failed');
        reset();
    }
    const onDelete = async () => {
        if (window.confirm('Sure to delete?')) {
            try {
                const newReservation = {
                    ...reservation,
                    arrivalTime: (new Date(reservation.arrivalTime)).getTime(),
                    status: 'Canceled',
                };
                await updateReservation({ variables: newReservation });
                dispatch({ type: 'deleted', id: reservation.id });
            } catch (err) {
                console.log(err);
            }

            setIsEditing(false);
        }
    };
    return (
        <TableRow key={reservation.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {
                (context.userType === 'Guest') ?
                    (<TableCell component="th" scope="row">{reservation.guestName}</TableCell>) :
                    (<TableCell component="th" scope="row">
                        <TextField value={guestName} onChange={e => setGuestName(e.target.value)}></TextField>
                    </TableCell>)
            }
            <TableCell align="right">
                <TextField value={guestPhone} onChange={e => setGuestPhone(e.target.value)}></TextField>
            </TableCell>
            <TableCell align="right">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker value={dayjs(arrivalTime)} onChange={e => { if (e) setArrivalTime(e.toDate()); }} />
                </LocalizationProvider>
            </TableCell>
            <TableCell align="right">
                <input type='number' max={20} min={1} value={tableSize} onChange={e => setTableSize(parseInt(e.target.value, 10))}></input>
            </TableCell>
            {
                (context.userType === 'Guest') ?
                    (<TableCell align="right">{reservation.status}</TableCell>) :
                    (<TableCell align="right">
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={status}
                            label="Status"
                            onChange={e => setStatus(e.target.value)}
                        >
                            <MenuItem value={'Created'}>Created</MenuItem>
                            <MenuItem value={'Completed'}>Completed</MenuItem>
                        </Select>
                    </TableCell>)
            }
            <TableCell align="right">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const newReservation = (context.userType === 'Guest') ?
                                {
                                    ...reservation,
                                    guestPhone,
                                    arrivalTime: (new Date(arrivalTime)).getTime(),
                                    tableSize,
                                } :
                                {
                                    ...reservation,
                                    guestName,
                                    guestPhone,
                                    arrivalTime: (new Date(arrivalTime)).getTime(),
                                    tableSize,
                                    status,
                                };
                            await updateReservation({ variables: newReservation });
                            dispatch({ type: 'update', reservation: newReservation });
                            setIsEditing(false);
                        } catch (err) {
                            console.log(err);
                        }
                    }}
                >
                    <Button sx={{ m: 2 }} variant='contained' type="submit">Ok</Button>
                    <Button sx={{ m: 2 }} variant='contained' onClick={() => { setIsEditing(false) }}>Cancel</Button>
                </form>
            </TableCell>
            <TableCell align="right">
                <Button variant='contained' onClick={onDelete}>Delete</Button>
            </TableCell>
        </TableRow >
    );
}

function ReservationRow({ reservation, dispatch }: { reservation: Reservation, dispatch: any }) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (<EditingReservationRow reservation={reservation} setIsEditing={setIsEditing} dispatch={dispatch}></EditingReservationRow>)
    }

    const edit = async () => {
        setIsEditing(true);
    };
    return (
        <TableRow key={reservation.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell component="th" scope="row">{reservation.guestName}</TableCell>
            <TableCell align="right">{reservation.guestPhone}</TableCell>
            <TableCell align="right">{(new Date(reservation.arrivalTime)).toLocaleString()}</TableCell>
            <TableCell align="right">{reservation.tableSize}</TableCell>
            <TableCell align="right">{reservation.status}</TableCell>
            <TableCell align="right">
                <Button variant='contained' onClick={edit}>Edit</Button>
            </TableCell>
            <TableCell align="right"></TableCell>
        </TableRow>
    );
}

function AddingReservationRow({ dispatch, setIsAdding }: { dispatch: any, setIsAdding: any }) {
    const [addReservation, { loading, error, data, reset }] = useMutation(ADD_RESERVATIONS);
    const context = useContext(AuthenticationContext);
    const [guestName, setGuestName] = useState((context.userType === 'Guest') ? context.name : '');
    const [guestPhone, setGuestPhone] = useState('');
    const [tableSize, setTableSize] = useState(1);
    const [arrivalTime, setArrivalTime] = useState(new Date());

    if (loading) {
        return (<CircularProgress />);
    }
    if (error) {
        alert('Edit Reservation Failed');
        reset();
    }
    if (data) {
        dispatch({ type: 'add', reservation: data.addReservation });
        setIsAdding(false);
    }
    return (
        <TableRow key="add-guest" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {
                (context.userType === 'Guest') ?
                    (<TableCell component="th" scope="row">{guestName}</TableCell>) :
                    (<TableCell component="th" scope="row">
                        <TextField value={guestName} onChange={e => setGuestName(e.target.value)}></TextField>
                    </TableCell>)
            }
            <TableCell align="right">
                <TextField value={guestPhone} onChange={e => setGuestPhone(e.target.value)}></TextField>
            </TableCell>
            <TableCell align="right">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker value={dayjs(arrivalTime)} onChange={e => { if (e) setArrivalTime(e.toDate()); }} />
                </LocalizationProvider>
            </TableCell>
            <TableCell align="right">
                <input type='number' max={20} min={1} value={tableSize} onChange={e => setTableSize(parseInt(e.target.value, 10))}></input>
            </TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const newReservation = {
                                guestName,
                                guestPhone,
                                arrivalTime: (new Date(arrivalTime)).getTime(),
                                tableSize,
                            };
                            await addReservation({ variables: newReservation });
                        } catch (err) {
                            console.log(err);
                        }
                    }}
                >
                    <Button sx={{ m: 2 }} variant='contained' type="submit">Ok</Button>
                    <Button sx={{ m: 2 }} variant='contained' onClick={() => { setIsAdding(false) }}>Cancel</Button>
                </form>
            </TableCell>
            <TableCell align="right"></TableCell>
        </TableRow >
    )
}

function AddReservationRow({ dispatch }: { dispatch: any }) {
    const [isAdding, setIsAdding] = useState(false);

    if (isAdding) {
        return (<AddingReservationRow dispatch={dispatch} setIsAdding={setIsAdding}></AddingReservationRow>);
    }
    return (
        <TableRow key="Add-Row" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell component="th" scope="row"></TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right">
                <Button variant='contained' onClick={() => setIsAdding(true)}>Add</Button>
            </TableCell>
            <TableCell align="right"></TableCell>
        </TableRow>
    );
}

function ReservationsTable({ reservationList }: { reservationList: Reservation[] }) {
    const [reservations, dispatch] = useReducer(ReservationsReducer, reservationList);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: '64em' }} >
                <TableHead key="tHead">
                    <TableRow key="Header">
                        <TableCell>Guest Name</TableCell>
                        <TableCell>Phone Number</TableCell>
                        <TableCell>Arrival Time</TableCell>
                        <TableCell>Table Size</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody key="tBody">
                    {
                        reservations.map(
                            (r: Reservation) => (<ReservationRow reservation={r} dispatch={dispatch} />)
                        )
                    }
                    <AddReservationRow dispatch={dispatch}></AddReservationRow>
                </TableBody>
            </Table>
        </TableContainer>
    )

}

function ReservationsList({ variables }: { variables: any }) {
    const { loading, error, data, refetch } = useQuery(GET_RESERVATIONS, { variables, fetchPolicy: 'no-cache' });
    console.log(variables);

    const handleClick = async () => {
        refetch();
    };
    if (loading) {
        return (<CircularProgress />);
    }
    if (error) {
        return (
            <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity="error">Fetch Failed.</Alert>
                <Button variant="contained" onClick={handleClick}>Refresh</Button>
            </Stack>
        )
    }
    return (
        <Box>
            <ReservationsTable reservationList={data.reservations} />
        </Box>
    );
}

function ReservationQuery() {
    const context = useContext(AuthenticationContext);
    const t1 = new Date();
    t1.setHours(0, 0, 0, 0);
    const [beginDate, setBeginDate] = useState(t1);
    const t2 = new Date(t1.setDate(t1.getDate() + 7));
    const [endDate, setEndDate] = useState(t2);
    const [status, setStatus] = useState('All');
    const [enableBeginDate, setEnableBeginDate] = useState(false);
    const [enableEndDate, setEnableEndDate] = useState(false);
    const variables: any = {};

    if (status !== 'All') {
        variables['status'] = status;
    }
    if (enableBeginDate) {
        variables['begin'] = beginDate.getTime();
    }
    if (enableEndDate) {
        variables['end'] = endDate.getTime();
    }

    return (
        <Box>
            <ReservationsList variables={variables} />
            <Grid container spacing={3}>
                {
                    (context.userType === 'Guest') ?
                        (<Grid size={4}></Grid>) :
                        (
                            <Grid size={4}>
                                <Select sx={{ width: '12em' }}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={status}
                                    label="Status"
                                    onChange={e => setStatus(e.target.value)}
                                >
                                    <MenuItem value={'All'}>All</MenuItem>
                                    <MenuItem value={'Created'}>Created</MenuItem>
                                    <MenuItem value={'Completed'}>Completed</MenuItem>
                                </Select>
                            </Grid>
                        )
                }
                {
                    (context.userType === 'Guest') ?
                        (<Grid size={4}></Grid>) :
                        (
                            <Grid size={4}>
                                <FormControlLabel control={
                                    <Switch checked={enableBeginDate} onChange={e => setEnableBeginDate(e.target.checked)} />
                                } label="Begin" />
                                {
                                    (enableBeginDate) ?
                                        (<LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker value={dayjs(beginDate)} onChange={e => { if (e) setBeginDate(e.toDate()); }} />
                                        </LocalizationProvider>) :
                                        (<div></div>)
                                }
                            </Grid>
                        )
                }
                {
                    (context.userType === 'Guest') ?
                        (<Grid size={4}></Grid>) :
                        (
                            <Grid size={4}>
                                <FormControlLabel control={
                                    <Switch checked={enableEndDate} onChange={e => setEnableEndDate(e.target.checked)} />
                                } label="End" />
                                {
                                    (enableEndDate) ?
                                        (<LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker value={dayjs(endDate)} onChange={e => { if (e) setEndDate(e.toDate()); }} />
                                        </LocalizationProvider>) :
                                        (<div></div>)
                                }
                            </Grid>
                        )
                }
            </Grid>
        </Box>
    )
}


function Reservations() {
    const context = useContext(AuthenticationContext);
    if (context.token === '') {
        return (
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: '64em' }} >
                    <TableHead>
                        <TableRow>
                            <TableCell>Guest Name</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Arrival Time</TableCell>
                            <TableCell>Table Size</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
    return (<ReservationQuery />);
}

export default Reservations;


import { useContext, useState, useReducer } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { CircularProgress, Alert, Stack, Button, TextField } from '@mui/material';
import { TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { AuthenticationContext } from './AuthenticationContext';
import ReservationsReducer from './ReservationsReducer';


const GET_RESERVATIONS = gql`
    query {
        reservations{
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
    if (context.userType === 'Guest') {
        return (
            <TableRow key={reservation.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{reservation.guestName}</TableCell>
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
                <TableCell align="right">
                    {reservation.status}
                </TableCell>
                <TableCell align="right">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const newReservation = {
                                    ...reservation,
                                    guestPhone,
                                    arrivalTime: (new Date(arrivalTime)).getTime(),
                                    tableSize,
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
    return (
        <TableRow key={reservation.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell component="th" scope="row">
                <TextField value={guestName} onChange={e => setGuestName(e.target.value)}></TextField>
            </TableCell>
            <TableCell align="right">
                <TextField value={guestPhone} onChange={e => setGuestPhone(e.target.value)}></TextField>
            </TableCell>
            <TableCell align="right">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker value={dayjs(arrivalTime)} onChange={e => { if (e) setArrivalTime(e.toDate()); }} />
                </LocalizationProvider>
            </TableCell>
            <TableCell align="right">
                <input type='number' max={100} min={1} value={tableSize} onChange={e => setTableSize(parseInt(e.target.value, 10))}></input>
            </TableCell>
            <TableCell align="right">
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
            </TableCell>
            <TableCell align="right">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const newReservation = {
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
    if (context.userType === 'Guest') {
        return (
            <TableRow key="add-guest" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">{guestName}</TableCell>
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
    return (
        <TableRow key="add-guest" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell component="th" scope="row">
                <TextField value={guestName} onChange={e => setGuestName(e.target.value)}></TextField>
            </TableCell>
            <TableCell align="right">
                <TextField value={guestPhone} onChange={e => setGuestPhone(e.target.value)}></TextField>
            </TableCell>
            <TableCell align="right">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker value={dayjs(arrivalTime)} onChange={e => { if (e) setArrivalTime(e.toDate()); }} />
                </LocalizationProvider>
            </TableCell>
            <TableCell align="right">
                <input type='number' max={100} min={1} value={tableSize} onChange={e => setTableSize(parseInt(e.target.value, 10))}></input>
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

function ReservationsList() {
    const { loading, error, data, refetch } = useQuery(GET_RESERVATIONS);

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
    return (<ReservationsTable reservationList={data.reservations}></ReservationsTable>)
}

const Reservations = () => {
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
    return (<ReservationsList></ReservationsList>)
}

export default Reservations;


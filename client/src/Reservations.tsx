import { gql, useQuery } from '@apollo/client';
import { CircularProgress, Alert, Stack, Button } from '@mui/material';
import { TableCell, Table, TableBody, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { AuthenticationContext } from './AuthenticationContext';
import { useContext } from 'react';


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

// const ADD_RESERVATIONS = gql``;

// const UPDATE_RESERVATIONS = gql``;


interface Reservation {
    id: string;
    guestName: string;
    guestPhone: string;
    arrivalTime: Date;
    tableSize: number;
    status: string;
};

function ReservationRow({ reservation }: { reservation: Reservation }) {
    return (
        <TableRow key={reservation.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell component="th" scope="row">{reservation.guestName}</TableCell>
            <TableCell align="right">{reservation.guestPhone}</TableCell>
            <TableCell align="right">{(new Date(reservation.arrivalTime)).toLocaleString()}</TableCell>
            <TableCell align="right">{reservation.tableSize}</TableCell>
            <TableCell align="right">{reservation.status}</TableCell>
        </TableRow>
    );
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
                    {
                        data.reservations.map(
                            (r: Reservation) => (<ReservationRow reservation={r} />)
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const Reservations = () => {
    const context = useContext(AuthenticationContext);
    console.log(context);
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


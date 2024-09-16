import React from 'react';
import { gql, useQuery } from '@apollo/client';

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

const Reservations = () => {
    const { loading, error, data } = useQuery(GET_RESERVATIONS);
    if (loading) {
        return (<div>Loading...</div>);
    }
    if (error) {
        return (<div>Error</div>)
    }
    const rows: JSX.Element[] = [];
    data.reservations.forEach((r: any) => {
        rows.push(
            <li key={r.id}>
                {r.guestName} - {r.guestPhone} - {new Date(r.arrivalTime)} - {r.tableSize + 12} - {r.status}
            </li>
        )
    });
    return (
        <ul>
            {data.reservations.map((r: any) => (
                <li key={r.id}>
                    {r.guestName} - {r.guestPhone} - {(new Date(r.arrivalTime)).toString()} - {r.tableSize} - {r.status}
                </li>
            )
            )}
        </ul>
    )
}

export default Reservations;


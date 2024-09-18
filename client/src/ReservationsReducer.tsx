export default function ReservationsReducer(reservations: any, action: any): any {
    switch (action.type) {
        case 'update': {
            return reservations.map((r: any) => {
                if (r.id === action.reservation.id) {
                    return action.reservation;
                }
                return r;
            });
        }
        case 'add': {
            if (reservations.find((r: any) => r.id === action.reservation.id)) {
                return reservations;
            }
            return [...reservations, action.reservation];
        }
        case 'deleted': {
            return reservations.filter((r: any) => r.id !== action.id);
        }
        default: {
            return reservations;
        }
    }
}

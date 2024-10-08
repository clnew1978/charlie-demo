<script setup lang="ts">
import gql from 'graphql-tag';
import { ref } from 'vue';
import { useAuthenticationStore } from '../stores/authentication';
import ReservationRow from './ReservationRow.vue';
import AddRow from './AddRow.vue';

</script>

<script lang="ts">
interface Reservation {
    id: string;
    guestName: string;
    guestPhone: string;
    arrivalTime: Date;
    tableSize: number;
    status: string;
};

export default {
    data() {
        const store = useAuthenticationStore();
        const that: any = this;
        store.$subscribe((_mutation, state) => {
            if (state.token === '') {
                that.reservations = [] as Reservation[];
                return;
            }
            that.reload();
        });
        const current = new Date();
        current.setHours(0, 0, 0, 0);
        const beginTimeVal = new Date(current);
        current.setDate(current.getDate() + 7);
        const endTimeVal = new Date(current);
        return {
            store,
            reservations: [] as Reservation[],
            statusFilter: ref('All'),
            enableBeginTime: ref(false),
            beginTime: ref(beginTimeVal),
            enableEndTime: ref(false),
            endTime: ref(endTimeVal),
            addFailedAlert: ref(false),
            editFailedAlert: ref(false),
            deleteFailedAlert: ref(false),
        }
    },
    apollo: {
        reservations: {
            query: gql`
                query reservations($begin: Date, $end: Date, $status: ReservationStatus) {
                    reservations(begin: $begin, end: $end, status: $status){
                        id
                        guestName
                        guestPhone
                        arrivalTime
                        tableSize
                        status
                    }
                }`,
            variables: {},
            update({ reservations }) {
                return reservations.map((u: any) => ({ ...u, arrivalTime: new Date(u.arrivalTime) } as Reservation));
            }
        },
    },
    methods: {
        reload() {
            const variables: any = {};
            if (this.enableBeginTime) {
                variables['begin'] = this.beginTime.getTime();
            }
            if (this.enableEndTime) {
                variables['end'] = this.endTime.getTime();
            }
            if (this.statusFilter !== 'All') {
                variables['status'] = this.statusFilter;
            }
            this.$apollo.query({
                query: gql`
                query reservations($begin: Date, $end: Date, $status: ReservationStatus) {
                    reservations(begin: $begin, end: $end, status: $status){
                        id
                        guestName
                        guestPhone
                        arrivalTime
                        tableSize
                        status
                    }
                }`,
                variables,
            }).then(({ data: { reservations } }) => {
                this.reservations = reservations.map((u: any) => ({
                    id: u.id,
                    guestName: u.guestName,
                    guestPhone: u.guestPhone,
                    arrivalTime: new Date(u.arrivalTime),
                    tableSize: u.tableSize,
                    status: u.status,
                }));
            })
        },
        onAddFailed() {
            this.addFailedAlert = true;
            this.reload();
        },
        onEditFailed() {
            this.editFailedAlert = true;
            this.reload();
        },
        onDeleteFailed() {
            this.deleteFailedAlert = true;
            this.reload();
        }
    }
}
</script>

<template>
    <v-alert v-model="addFailedAlert" type="error" closable>Add Reservation Failed</v-alert>
    <v-alert v-model="editFailedAlert" type="error" closable>Edit Reservation Failed</v-alert>
    <v-alert v-model="deleteFailedAlert" type="error" closable>Delete Reservation Failed</v-alert>
    <v-table>
        <thead>
            <tr>
                <th class="text-left" style="min-width: 12em">Guest Name</th>
                <th class="text-left" style="min-width: 12em">Phone Number</th>
                <th class="text-left" style="min-width: 16em">Arrival Time</th>
                <th class="text-left" style="min-width: 8em">Table Size</th>
                <th class="text-left" style="min-width: 12em">Status</th>
                <th class="text-left" style="min-width: 22em"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in reservations" :key="item.id">
                <ReservationRow v-bind="item" @deleted="reload" @edited="reload" @edit-failed="onEditFailed"
                    @delete-failed="onDeleteFailed"></ReservationRow>
            </tr>
            <tr v-if="store.isLogin">
                <AddRow @added="reload" @add-failed="onAddFailed"></AddRow>
            </tr>
        </tbody>
    </v-table>

    <v-container v-if="store.isLogin && store.isEmployee">
        <v-row no-gutters>
            <v-col cols="12" sm="4">
                <v-select label="Status" :items="['All', 'Created', 'Completed']" v-model="statusFilter"
                    @update:modelValue="reload" style="margin-left: 2em;margin-right: 2em;"></v-select>
            </v-col>
            <v-col cols="12" sm="4">
                <v-switch label="Begin Time" color="primary" v-model="enableBeginTime"
                    @update:modelValue="reload"></v-switch>
                <v-date-picker v-if="enableBeginTime" color="primary" title="Begin Time" v-model="beginTime"
                    @update:modelValue="reload"></v-date-picker>
            </v-col>
            <v-col cols="12" sm="4">
                <v-switch label="End Time" color="primary" v-model="enableEndTime"
                    @update:modelValue="reload"></v-switch>
                <v-date-picker v-if="enableEndTime" color="primary" title="End Time" v-model="endTime"
                    @update:modelValue="reload"></v-date-picker>
            </v-col>
        </v-row>
    </v-container>
</template>

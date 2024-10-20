<script setup lang="ts">
import gql from 'graphql-tag';
import { useAuthenticationStore } from '../stores/authentication';
import { ref } from 'vue';
defineProps({
    id: String,
    guestName: String,
    guestPhone: String,
    arrivalTime: Date,
    tableSize: Number,
    status: String,
});
defineEmits(['deleted', 'edited', 'deleteFailed', 'editFailed']);
</script>

<script lang="ts">
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
}`;

export default {
    data() {
        const store = useAuthenticationStore();
        return {
            store,
            editing: false,
            guestNameRef: ref(this.guestName),
            guestPhoneRef: ref(this.guestPhone),
            arrivalTimeRef: ref(this.arrivalTime ? this.arrivalTime : new Date()),
            tableSizeRef: ref(this.tableSize),
            statusRef: ref(this.status),
        };
    },
    methods: {
        setTime(event: any) {
            if (event && event.target && event.target.valueAsNumber) {
                this.arrivalTimeRef = new Date(event.target.valueAsNumber);
            }
        },
        clickDelete() {
            const variables = {
                id: this.id,
                guestName: this.guestName,
                guestPhone: this.guestPhone,
                arrivalTime: this.arrivalTime?.getTime(),
                tableSize: this.tableSize,
                status: 'Canceled',
            }
            this.$apollo.mutate({
                mutation: UPDATE_RESERVATIONS,
                variables,
            }).then((result) => {
                if (!result.data || result.errors) {
                    this.$emit('deleteFailed');
                } else {
                    this.$emit('deleted');
                }
            }).catch(() => this.$emit('deleteFailed'));
            this.editing = false;
        },
        clickOK() {
            const variables = {
                id: this.id,
                guestName: this.guestNameRef,
                guestPhone: this.guestPhoneRef,
                arrivalTime: this.arrivalTimeRef.getTime(),
                tableSize: Number(this.tableSizeRef),
                status: this.statusRef,
            }
            this.$apollo.mutate({
                mutation: UPDATE_RESERVATIONS,
                variables,
            }).then((result) => {
                if (!result.data || result.errors) {
                    this.$emit('editFailed');
                } else {
                    this.$emit('edited');
                }
            }).catch(() => this.$emit('editFailed'));
            this.editing = false;
        }
    }
};
</script>

<template>
    <td v-if="editing && store.isEmployee">
        <v-text-field v-model="guestNameRef" label="Guest Name" required></v-text-field>
    </td>
    <td v-else>{{ guestNameRef }}</td>
    <td v-if="editing">
        <v-text-field v-model="guestPhoneRef" label="Phone Number" required></v-text-field>
    </td>
    <td v-else>{{ guestPhoneRef }}</td>
    <td v-if="editing">
        <input type="datetime-local" :value="arrivalTimeRef.toISOString().slice(0, -5)" @input="setTime($event)">
    </td>
    <td v-else>{{ arrivalTimeRef.toISOString() }}</td>
    <td v-if="editing">
        <v-text-field v-model="tableSizeRef" label="Table Size" type="number" max="50" min="1" required></v-text-field>
    </td>
    <td v-else>{{ tableSizeRef }}</td>
    <td v-if="editing && store.isEmployee">
        <v-select label="Status" :items="['Created', 'Completed']" v-model="statusRef"></v-select>
    </td>
    <td v-else>{{ statusRef }}</td>
    <td v-if="status === 'Completed'"></td>
    <td v-else-if="editing">
        <v-btn color="primary" @click="clickOK" style="margin-right: 0.5em;">OK</v-btn>
        <v-btn color="primary" @click="editing = false" style="margin-right: 0.5em;">Cancel</v-btn>
        <v-btn color="primary" @click="clickDelete">Delete</v-btn>
    </td>
    <td v-else>
        <v-btn color="primary" @click="editing = true">Edit</v-btn>
    </td>
</template>
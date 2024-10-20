<script setup lang="ts">
import { ref } from 'vue';
import { useAuthenticationStore } from '../stores/authentication';
import gql from 'graphql-tag';

defineEmits(['added', 'addFailed']);
</script>

<script lang="ts">
export default {
    data() {
        const store = useAuthenticationStore();
        return {
            store,
            adding: ref(false),
            guestNameRef: ref(store.isEmployee ? '' : store.name),
            guestPhoneRef: ref(''),
            arrivalTimeRef: ref(new Date()),
            tableSizeRef: ref(1),
        };
    },
    methods: {
        onAdding() {
            this.guestNameRef = this.store.isEmployee ? '' : this.store.name;
            this.guestPhoneRef = '';
            this.arrivalTimeRef = new Date();
            this.tableSizeRef = 1;
            this.adding = true;
        },
        onCancel() {
            this.adding = false;
        },
        onOK() {
            const variables = {
                guestName: this.guestNameRef,
                guestPhone: this.guestPhoneRef,
                arrivalTime: this.arrivalTimeRef.getTime(),
                tableSize: Number(this.tableSizeRef),
            };
            this.$apollo.mutate({
                mutation: gql`
                    mutation addReservation($guestName: String!,$guestPhone: String!,$arrivalTime: Date!,$tableSize: Int!) {
                    addReservation(input:{guestName:$guestName,guestPhone:$guestPhone,arrivalTime:$arrivalTime,tableSize:$tableSize}){
                        id
                        guestName
                        guestPhone
                        arrivalTime
                        tableSize
                        status
                    }
                }`,
                variables,
            }).then((result) => {
                if (!result.data || result.errors) {
                    this.$emit('addFailed');
                } else {
                    this.$emit('added');
                }
            }).catch(() => this.$emit('addFailed'));
            this.onCancel();
        },
        setTime(event: any) {
            if (event && event.target && event.target.valueAsNumber) {
                this.arrivalTimeRef = new Date(event.target.valueAsNumber);
            }
        }
    }
}
</script>

<template>
    <td v-if="adding && store.isEmployee">
        <v-text-field v-model="guestNameRef" label="Guest Name" required></v-text-field>
    </td>
    <td v-else-if="adding"> {{ guestNameRef }}</td>
    <td v-else></td>
    <td v-if="adding">
        <v-text-field v-model="guestPhoneRef" label="Guest Phone" required></v-text-field>
    </td>
    <td v-else></td>
    <td v-if="adding">
        <input type="datetime-local" :value="arrivalTimeRef.toISOString().slice(0, -5)" @input="setTime($event)">
    </td>
    <td v-else></td>
    <td v-if="adding">
        <v-text-field v-model="tableSizeRef" label="Table Size" type="number" max="50" min="1" required></v-text-field>
    </td>
    <td v-else></td>
    <td v-if="adding"></td>
    <td v-else></td>
    <td v-if="adding">
        <v-btn color="primary" @click="onOK" style="margin-right: 1em;">OK</v-btn>
        <v-btn color="primary" @click="onCancel">Cancel</v-btn>
    </td>
    <td v-else>
        <v-btn color="primary" @click="onAdding">Add</v-btn>
    </td>

</template>
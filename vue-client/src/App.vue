<script setup lang="ts">
import LoginDialog from './components/LoginDialog.vue'
import ReservationTable from './components/ReservationTable.vue'
</script>

<script lang="ts">
</script>

<template>
  <v-app>
    <v-container>
      <v-app-bar color="primary" rounded>
        <v-app-bar-title>Charlie Demo</v-app-bar-title>
        <template v-slot:append>
          <LoginDialog ref="loginName"></LoginDialog>
        </template>
      </v-app-bar>
    </v-container>


    <v-container>
      <ReservationTable></ReservationTable>
    </v-container>
  </v-app>
</template>

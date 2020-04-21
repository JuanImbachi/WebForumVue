<template>
    <div class="container">
        <v-data-table
        :headers="headers"
        :items="users"
        item-key="id"
        class="elevation-1"
        :search="search"
        :custom-filter="filterText"
        calculate-widths:true
        >
        <template v-slot:top>
            <v-text-field v-model="search" label="Search" class="mx-4"></v-text-field>
        </template>
        </v-data-table>
    </div>
</template>

<script>
import firebase from '../config/firebase'
export default {
    data(){
        return{
            db: firebase.firestore(),
            users: [],
            search: '',     
        }
    },
    computed: {
      headers () {
        return [
          {
            text: 'Name',
            sortable: true,
            value: 'name',
            align: 'center'
          },
          {
            text: 'Last Name',
            sortable: true,
            value: 'lastname',
            align: 'center'
          },
          {
            text: 'Email',
            sortable: true,
            value: 'email',
            align: 'center'
          },
          {
            text: 'Active',
            sortable: true,
            value: 'active',
            align: 'center'
          }
        ]
      },
    },
    methods:{
         filterText (value, search) {
        return value != null &&
          search != null &&
          typeof value === 'string' &&
          value.toString().indexOf(search) !== -1
      },
        refresh()
        {
            this.db.collection("users").get().then((users) => {
                    users.forEach(userdb => 
                    {
                        let user = {
                          name: userdb.data().name,
                          lastname: userdb.data().lastname,
                          email: userdb.id,
                          active: userdb.data().active
                        }
                        this.users.push(user)
                    });
                })
        }
    },
    mounted: function () {
        this.refresh()
    }
}
</script>
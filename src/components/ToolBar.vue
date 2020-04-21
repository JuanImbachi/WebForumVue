<template>
  <v-toolbar dark src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
    <v-toolbar-items>
      <v-icon style="margin-right:5%">mdi-forum</v-icon>
      <v-btn to="/users" text>Users</v-btn>
      <v-btn to="/forums" text>Forums</v-btn>
    </v-toolbar-items>

    <v-spacer></v-spacer>

    <v-toolbar-items>
      <template v-if="user.loggedIn">
        <v-btn text @click="enableOptions = !enableOptions">{{user.data.email}}</v-btn>
        <template v-if="enableOptions" class="options">
          <v-btn @click="signOut" text>Sign Out</v-btn>
          <v-btn @click="deleteOption = true" text>Delete Account</v-btn>
          <v-btn @click="editAccount" text>Edit Account</v-btn>
        </template>
      </template>
      <template v-else>
        <v-btn to="/logIn" text>
          <v-icon left>mdi-account-circle</v-icon>Login
        </v-btn>
        <v-btn to="/signUp" text>
          <v-icon left>mdi-account-plus</v-icon>Sign Up
        </v-btn>
      </template>
    </v-toolbar-items>
    <v-dialog v-model="deleteOption" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">Delete Account</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="12">
              <v-text-field
                v-model="confirmpassword"
                :append-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showpassword ? 'text' : 'password'"
                label="Confirm password to delete account"
                @click:append="showpassword = !showpassword"
                prepend-icon="mdi-lock"
            ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions style="background-color:#1976d2">
        <v-spacer></v-spacer>
        <v-btn color="white" text @click="deleteOption = false">Close</v-btn>
        <v-btn color="white" text @click="deleteAccount" @hideDeleteOptions="deleteOption=false">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </v-toolbar>
</template>

<script>
import { mapGetters } from "vuex";
import firebase from "firebase";

export default {
  name: "App",
  computed: {
    ...mapGetters({
      user: "user"
    })
  },
  data() {
    return {
      confirmpassword: "",
      showpassword: false,
      deleteOption: false,
      enableOptions: false,
      db: firebase.firestore()
    };
  },
  methods: {
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          if (this.$route.name !== "forums") {
            console.log(this.user)
            this.$router.replace({
              name: "forums"
            });
          }
        });
    },
    deleteAccount() {
      this.db.collection('entries').get().then((entries) =>
      {
        let deletable = true
        for (let index = 0; index < entries.length && deletable; index++) 
        {
          const entry = entries.docs[index];
          if(entry.data().creator.id === this.user.data.email)
          {
            deletable = false
          }
        }
        if(deletable)
        {
          let user = firebase.auth().currentUser
          let userEmail= user.email
          var credential = firebase.auth.EmailAuthProvider.credential(userEmail, this.confirmpassword)
          user.reauthenticateWithCredential(credential).then(() => 
          {
            let db = this.db
            user.delete().then(function() 
            {
              db.collection('users').doc(userEmail).delete()
              
            }).catch(error => 
            {
              console.log(error.message)
            })
           })
        }
        this.deleteOption = false
      }).catch(error =>
      {
        console.log(error.message)
      })
    },
    editAccount(){
      this.$router.replace(
      {
        name: "updateAccount"
      });
    }
  }
};
</script>

<style scoped>
.v-toolbar--prominent .v-toolbar__content {
  align-items: center;
}
.v-list-item {
  background-color: transparent;
  height: 100%;
}
.options{
  /* height: 100%; */
  background: transparent;
  color: #fff;
  padding-bottom: 0;
  padding-top: 0;
}
</style>

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
                @keyup.enter="deleteAccount"
            ></v-text-field>
            <v-alert
            v-if="status != null"
            :type="status.type"
            outlined
            text
            :icon="status.icon"
            transition="scale-transition"
            >{{status.message}}</v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions style="background-color:#1976d2">
        <v-spacer></v-spacer>
        <v-btn color="white" text @click="deleteOption = false">Close</v-btn>
        <v-btn color="white" text @click="deleteAccount">Delete</v-btn>
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
      status: null,
      confirmpassword: "",
      showpassword: false,
      deleteOption: false,
      enableOptions: false,
      db: firebase.firestore()
    };
  },
  methods: {
    signOut() {
      firebase.auth().signOut().then(() => 
      {
        if (this.$route.name !== "forums") 
        {
          console.log(this.user)
          this.$router.replace(
          {
            name: "forums"
          });
        }
        });
    },
    deleteAccount() {
      let deleteError =  false
      this.enableOptions = false
      this.db.collection('entries').get().then((entries) =>
      {
        let deletable = true
        console.log("Se revisarán: " + entries.size + " entries")
        for (let index = 0; index < entries.size && deletable; index++) 
        {
          const entry = entries.docs[index];
          console.log("Creador Entry 1: " + entry.data().creator.id)
          console.log("Usuario a borrar: " + this.user.data.email)
          if(entry.data().creator.id === this.user.data.email)
          {
            deletable = false
          }
        }
        console.log("Se revisaron las entries: deletable: " + deletable)
        let deleteAccountStatus = null
        if(deletable)
        {
          let user = firebase.auth().currentUser
          var credential = firebase.auth.EmailAuthProvider.credential(user.email, this.confirmpassword)
          user.reauthenticateWithCredential(credential).then(() => 
          {
            console.log(user.email)
            this.db.collection("users").doc(user.email).delete().then(function() 
            {
              console.log("User profile deleted ");
              user.delete().then(function() 
              {
                console.log("User account deleted")
              }).catch((error) => 
              {
                deleteAccountStatus  = 
                {
                    type: 'error',
                    message: error.message,
                    icon: 'mdi-skull-outline'
                }
                deleteError = true
              })
            }).catch((error)=>
            {
              deleteAccountStatus  = 
              {
                  type: 'error',
                  message: error.message,
                  icon: 'mdi-skull-outline'
              }
              deleteError = true
            })
          }).catch((error) => 
          {
            if(error.code === "auth/wrong-password")
            {
              deleteAccountStatus  = 
              {
                  type: 'error',
                  message: error.message,
                  icon: 'mdi-skull-outline'
              }
            }
            else if(error.code === "auth/too-many-requests")
            {
              deleteAccountStatus  = 
              {
                  type: 'error',
                  message: error.message,
                  icon: 'mdi-skull-outline'
              }
            }
            deleteError = true
          }).finally(() => 
          {
            if(deleteError == false)
            {
              deleteAccountStatus  = 
              {
                  type: 'success',
                  message: 'Your account was deleted successfully',
                  icon: 'mdi-checkbox-marked-circle-outline'
              }
            }
            this.showStatus(deleteAccountStatus)
          })
        }
        else
        {
          deleteAccountStatus  = 
          {
              type: 'error',
              message: "Accounts with entries can't be deleted",
              icon: 'mdi-skull-outline'
          }
          this.showStatus(deleteAccountStatus)
        }
      }).catch(error =>
      {
        console.log(error.message)
      }).finally(() =>
      {
        this.confirmpassword = ""
        this.showpassword = false;
      })
    },
    editAccount(){
      this.enableOptions = false
      this.$router.replace(
      {
        name: "updateAccount"
      });
    },
    showStatus(status)
    {
      this.status = status
      if(status.type === "error")
      {
        setTimeout(() => {this.status = null}, 3000);
      }
      else if(status.type === "success")
      {
        setTimeout(() => {this.status = null; this.deleteOption = false}, 3000);
      }
    }
  }
};
</script>

<style scoped>
.v-alert {
    margin-bottom: 0;
}
.container {
    padding-bottom: 0;
}
</style>
